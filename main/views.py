from django.shortcuts import render
from django.http import HttpResponseRedirect

js = []
css = []

def index(request):
    css = [
        "/static/main/home/styles.css"
    ]

    return render(request, "main/home/home.html", {
        "csss" : css,
        "jss"  : js
    })
