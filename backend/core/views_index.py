from django.http import HttpResponse

def index(request):
    return HttpResponse("<h1>System Zbiórki Podpisów - Backend działa!</h1><p>Przejdź do: <a href='/admin/'>Panel Admina</a> lub otwórz Frontend na porcie 5173.</p>")
