from django.shortcuts import render


def main(request):

    return render(request, "frappe_gantte.html")
