import json
from django.http import JsonResponse
from django.contrib.auth.models import User
from task_manager.models.user_info import UserInfo
from django.db.models import Q
from django.contrib.auth.decorators import login_required

@login_required(login_url="login")
def main(request):
    if request.method == "POST":
        context = {
            "user_data": [],
        }

        body_unicode = request.body.decode("utf-8")
        body = json.loads(body_unicode)
        search_query = body["search_query"]

        if not search_query:
            return JsonResponse(context)

        users = User.objects.filter(
            Q(username__icontains=search_query)
            | Q(email__icontains=search_query)  # noqa: E501
        ).exclude(id=request.user.id)[:10]

        user_data = []
        for user in users:
            try:
                user_info = UserInfo.objects.get(user=user)
                photo_url = user_info.photo.url if user_info.photo else None
            except UserInfo.DoesNotExist:
                photo_url = None

            user_data.append(
                {
                    "id": user.id,
                    "name": user.username,
                    "email": user.email,
                    "photo": photo_url,
                }
            )

        context["user_data"] = user_data
        return JsonResponse(context)

    return JsonResponse({"error": "Invalid request method"}, status=405)
