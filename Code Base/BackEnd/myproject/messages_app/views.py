from django.shortcuts import render, redirect
from .models import Message
from .forms import MessageForm

def front_page(request):
    if request.method == 'POST':
        form = MessageForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('front_page')
    else:
        form = MessageForm()

    messages = Message.objects.all().order_by('-created_at')
    return render(request, 'front_page.html', {'form': form, 'messages': messages})
