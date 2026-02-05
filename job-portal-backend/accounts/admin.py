from django.contrib import admin
from .models import AdminProfile, EmployerProfile, JobSeekerProfile

@admin.register(AdminProfile)
class AdminProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "phone")

@admin.register(EmployerProfile)
class EmployerProfileAdmin(admin.ModelAdmin):
    list_display = ("company_name", "user", "phone", "created_at")
    search_fields = ("company_name", "user__username", "phone")

@admin.register(JobSeekerProfile)
class JobSeekerProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "phone", "experience_years", "created_at")
    search_fields = ("user__username", "user__email", "phone")
