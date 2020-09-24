from django.shortcuts import render

def chart_list(request):
    return render(request, 'charts/chart_list.html', {})
