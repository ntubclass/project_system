from django.http import JsonResponse
from task_manager.models.user_info import UserInfo

def main(request):
    if request.method == "POST":
        search_query = request.POST.get('search_query', '').strip()

        if not search_query:
            return JsonResponse({'error': 'Search query is required'}, status=400)

        users = UserInfo.objects.filter(name__icontains=search_query)
        user_data = [{'id': user.id, 'name': user.name} for user in users]

        return JsonResponse({'users': user_data})

    return JsonResponse({'error': 'Invalid request method'}, status=405)