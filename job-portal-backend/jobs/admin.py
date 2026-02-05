from django.contrib import admin
from .models import JobCategory, Job, Application

@admin.register(JobCategory)
class JobCategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "created_at")
    search_fields = ("name",)

@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ("title", "employer", "category", "is_active", "posted_at")
    list_filter = ("is_active", "category", "posted_at")
    search_fields = ("title", "employer__company_name")

@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ("job", "seeker", "status", "applied_at")
    list_filter = ("status", "applied_at")
