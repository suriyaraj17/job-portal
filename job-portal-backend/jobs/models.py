from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User
from accounts.models import EmployerProfile, JobSeekerProfile


class JobCategory(models.Model):
    name = models.CharField(max_length=120, unique=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    def __str__(self):
        return self.name

class Job(models.Model):
    employer = models.ForeignKey(EmployerProfile, on_delete=models.CASCADE, related_name="jobs")
    category = models.ForeignKey(JobCategory, on_delete=models.SET_NULL, null=True, blank = True, related_name="jobs")
    title = models.CharField(max_length=255)
    description = models.TextField()
    location = models.CharField(max_length=255, blank=True, null=True)
    salary = models.CharField(max_length=100, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    posted_at = models.DateTimeField(default=timezone.now)
    last_date = models.DateField(blank=True, null=True)

    def __str__(self):
        return f"{self.title} - {self.employer.company_name}"

class Application(models.Model):
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name="applications")
    seeker = models.ForeignKey(JobSeekerProfile, on_delete=models.CASCADE, related_name="applications")
    cover_letter = models.TextField(blank=True, null=True)
    applied_at = models.DateTimeField(default=timezone.now)
    status_choices = [
        ("applied", "Applied"),
        ("shortlisted", "Shortlisted"),
        ("rejected", "Rejected"),
        ("hired", "Hired"),
    ]
    status = models.CharField(max_length=20, choices=status_choices, default="applied")

    class Meta:
        unique_together = ("job", "seeker")

    def __str__(self):
        return f"{self.seeker.user.username} -> {self.job.title}"

# new
class Page(models.Model):
   title = models.CharField(max_length=100, null=True, blank=True)
   content = models.TextField(null=True, blank=True)

class EmployerMessage(models.Model):
    sender = models.ForeignKey(EmployerProfile, on_delete=models.CASCADE)
    receiver = models.ForeignKey(JobSeekerProfile, on_delete=models.CASCADE)
    application = models.ForeignKey(Application, on_delete=models.CASCADE)
    message = models.TextField()
    sent_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.sender.company_name} → {self.receiver.user.username}"

