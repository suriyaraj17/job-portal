from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
from cloudinary.models import CloudinaryField


class AdminProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="admin_profile")
    phone = models.CharField(max_length=20, blank=True, null=True)

    def __str__(self):
        return f"Admin: {self.user.username}"


class EmployerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="employer_profile")
    company_name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20, blank=True, null=True)
    address = models.CharField(max_length=500, blank=True, null=True)
    # company_logo = models.ImageField(upload_to="company_logos/", blank=True, null=True)
    company_logo = CloudinaryField('image', blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    website = models.URLField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    address = models.CharField(max_length=255, blank=True)
    def __str__(self):
        return self.company_name


class JobSeekerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="seeker_profile")

    phone = models.CharField(max_length=20, blank=True, null=True)
    # resume = CloudinaryField('resume', resource_type='raw', blank=True, null=True)
    resume = CloudinaryField('resume', resource_type='raw', blank=True, null=True)
    profile_pic = CloudinaryField('image', blank=True, null=True)

    skills = models.TextField(blank=True, null=True)
    experience_years = models.DecimalField(max_digits=4, decimal_places=1, default=0.0)
    college_name = models.CharField(max_length=255, blank=True, null=True)
    degree = models.CharField(max_length=255, blank=True, null=True)
    cgpa = models.DecimalField(max_digits=4, decimal_places=2, blank=True, null=True)
    passed_out_year = models.IntegerField(blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username}"


class EmailOTP(models.Model):
    email = models.EmailField()
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_valid(self):
        return timezone.now() <= self.created_at + timedelta(minutes=5)

    def __str__(self):
        return f"{self.email} - {self.otp}"


from django.db import models
from django.contrib.auth.models import User
import random

class PasswordResetOTP(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_expired(self):
        from django.utils import timezone
        return (timezone.now() - self.created_at).seconds > 300  # 5 minutes        
    

from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=User)
def create_user_profiles(sender, instance, created, **kwargs):
    if created:
        JobSeekerProfile.objects.get_or_create(user=instance)
        EmployerProfile.objects.get_or_create(user=instance)