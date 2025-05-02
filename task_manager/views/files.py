from django.shortcuts import render

def main(request):
    # 在這裡處理檔案數據邏輯
    return render(request, 'files.html')