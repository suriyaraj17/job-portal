from rest_framework import serializers
from jobs.models import Page, Message
from accounts.models import EmployerProfile, JobSeekerProfile
from jobs.models import Application, Job

class PageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Page
        fields = '__all__'

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = '__all__'
