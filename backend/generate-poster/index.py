"""
Business: Генерация постера статьи по заголовку через YandexART.
         Запускает асинхронную операцию, опрашивает результат, сохраняет PNG в S3, возвращает CDN-URL.
Args: event с httpMethod, body (JSON: {title: str, excerpt?: str, category?: str, style?: str})
      context с request_id
Returns: {url: str, prompt: str} или {error: str}
"""
import json
import os
import time
import base64
import uuid
import urllib.request
import urllib.error

import boto3


YANDEX_OPERATIONS_URL = "https://llm.api.cloud.yandex.net:443/operations/"
YANDEX_GENERATE_URL = "https://llm.api.cloud.yandex.net/foundationModels/v1/imageGenerationAsync"

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-User-Id, X-Auth-Token",
    "Access-Control-Max-Age": "86400",
}


def _resp(status: int, body: dict) -> dict:
    return {
        "statusCode": status,
        "headers": {**CORS_HEADERS, "Content-Type": "application/json"},
        "body": json.dumps(body, ensure_ascii=False),
        "isBase64Encoded": False,
    }


def _http_post(url: str, headers: dict, payload: dict, timeout: int = 30) -> dict:
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers=headers, method="POST")
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read().decode("utf-8"))


def _http_get(url: str, headers: dict, timeout: int = 30) -> dict:
    req = urllib.request.Request(url, headers=headers, method="GET")
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read().decode("utf-8"))


def _build_prompt(title: str, excerpt: str, category: str, style: str) -> str:
    base = (
        f"Минималистичный современный постер для статьи. "
        f"Тема: {title}."
    )
    if excerpt:
        base += f" Краткое описание: {excerpt}."
    if category:
        base += f" Категория: {category}."
    if style:
        base += f" Стиль: {style}."
    else:
        base += (
            " Стиль: чистый редакционный дизайн, мягкие бежевые и тёплые тона, "
            "много воздуха, негативное пространство, абстрактные геометрические "
            "формы, спокойная композиция, журнальная эстетика. Без текста и без надписей."
        )
    return base


def _start_generation(api_key: str, folder_id: str, prompt: str) -> str:
    headers = {
        "Authorization": f"Api-Key {api_key}",
        "Content-Type": "application/json",
        "x-folder-id": folder_id,
    }
    payload = {
        "modelUri": f"art://{folder_id}/yandex-art/latest",
        "generationOptions": {
            "seed": str(int(time.time())),
            "aspectRatio": {"widthRatio": "16", "heightRatio": "9"},
        },
        "messages": [{"weight": "1", "text": prompt}],
    }
    result = _http_post(YANDEX_GENERATE_URL, headers, payload, timeout=30)
    op_id = result.get("id")
    if not op_id:
        raise RuntimeError(f"Не получен id операции: {result}")
    return op_id


def _wait_for_image(api_key: str, op_id: str, max_wait_sec: int = 50) -> bytes:
    headers = {"Authorization": f"Api-Key {api_key}"}
    deadline = time.time() + max_wait_sec
    delay = 2.0
    while time.time() < deadline:
        info = _http_get(YANDEX_OPERATIONS_URL + op_id, headers, timeout=15)
        if info.get("done"):
            err = info.get("error")
            if err:
                raise RuntimeError(f"YandexART вернул ошибку: {err}")
            image_b64 = info.get("response", {}).get("image")
            if not image_b64:
                raise RuntimeError(f"В ответе нет image: {info}")
            return base64.b64decode(image_b64)
        time.sleep(delay)
        delay = min(delay + 0.5, 4.0)
    raise TimeoutError("YandexART не успел сгенерировать постер за отведённое время")


def _upload_to_s3(image_bytes: bytes) -> str:
    access_key = os.environ["AWS_ACCESS_KEY_ID"]
    secret_key = os.environ["AWS_SECRET_ACCESS_KEY"]

    s3 = boto3.client(
        "s3",
        endpoint_url="https://bucket.poehali.dev",
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key,
    )
    key = f"posters/{uuid.uuid4().hex}.png"
    s3.put_object(
        Bucket="files",
        Key=key,
        Body=image_bytes,
        ContentType="image/png",
    )
    return f"https://cdn.poehali.dev/projects/{access_key}/bucket/{key}"


def handler(event: dict, context) -> dict:
    """Принимает заголовок статьи и возвращает URL сгенерированного постера."""
    method = event.get("httpMethod", "GET")

    if method == "OPTIONS":
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": ""}

    if method != "POST":
        return _resp(405, {"error": "Method not allowed"})

    try:
        body = json.loads(event.get("body") or "{}")
    except Exception:
        return _resp(400, {"error": "Некорректный JSON в теле запроса"})

    title = str(body.get("title") or "").strip()
    if not title:
        return _resp(400, {"error": "Поле title обязательно"})

    api_key = os.environ.get("YANDEX_API_KEY")
    folder_id = os.environ.get("YANDEX_FOLDER_ID")
    if not api_key or not folder_id:
        return _resp(503, {"error": "Сервис генерации не настроен: добавьте YANDEX_API_KEY и YANDEX_FOLDER_ID"})

    excerpt = str(body.get("excerpt") or "").strip()[:300]
    category = str(body.get("category") or "").strip()[:100]
    style = str(body.get("style") or "").strip()[:200]

    prompt = _build_prompt(title, excerpt, category, style)

    try:
        op_id = _start_generation(api_key, folder_id, prompt)
        image_bytes = _wait_for_image(api_key, op_id, max_wait_sec=50)
        url = _upload_to_s3(image_bytes)
        return _resp(200, {"url": url, "prompt": prompt})
    except urllib.error.HTTPError as e:
        try:
            err_body = e.read().decode("utf-8")
        except Exception:
            err_body = str(e)
        return _resp(502, {"error": f"Ошибка YandexART {e.code}: {err_body[:500]}"})
    except TimeoutError as e:
        return _resp(504, {"error": str(e)})
    except Exception as e:
        return _resp(500, {"error": f"Не удалось сгенерировать постер: {str(e)[:300]}"})