from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from accounts.models import AdminProfile, EmployerProfile, JobSeekerProfile
from jobs.models import JobCategory, Job, Application
from django.utils import timezone
from datetime import date

class Command(BaseCommand):
    help = "Seed database with sample data"

    def handle(self, *args, **kwargs):
        self.stdout.write("Deleting old data...")
        Application.objects.all().delete()
        Job.objects.all().delete()
        JobCategory.objects.all().delete()
        EmployerProfile.objects.all().delete()
        JobSeekerProfile.objects.all().delete()
        AdminProfile.objects.all().delete()
        User.objects.exclude(is_superuser=True).delete()

        # --- USERS ---
        admin_user = User.objects.create_user(username="admin1", password="admin123")
        AdminProfile.objects.create(user=admin_user, phone="9876543210")

        emp1_user = User.objects.create_user(username="employer1", password="test123")
        emp2_user = User.objects.create_user(username="employer2", password="test123")

        employer1 = EmployerProfile.objects.create(
            user=emp1_user, company_name="TechCorp Pvt Ltd", phone="9000011111",
            address="Chennai", created_at=timezone.now()
        )
        employer2 = EmployerProfile.objects.create(
            user=emp2_user, company_name="FutureSoft Solutions", phone="9000022222",
            address="Bangalore", created_at=timezone.now()
        )

        seek1_user = User.objects.create_user(username="jobseeker1", password="test123")
        seek2_user = User.objects.create_user(username="jobseeker2", password="test123")
        seek3_user = User.objects.create_user(username="jobseeker3", password="test123")

        seeker1 = JobSeekerProfile.objects.create(
            user=seek1_user, phone="7000012345", skills="Python, SQL", experience_years=1.5
        )
        seeker2 = JobSeekerProfile.objects.create(
            user=seek2_user, phone="7000022345", skills="Java, Spring", experience_years=2.0
        )
        seeker3 = JobSeekerProfile.objects.create(
            user=seek3_user, phone="7000032345", skills="HTML, CSS, JS", experience_years=0.5
        )

        # --- CATEGORIES ---
        cat1 = JobCategory.objects.create(name="Software Development", description="Software jobs")
        cat2 = JobCategory.objects.create(name="Data Science", description="ML, AI jobs")
        cat3 = JobCategory.objects.create(name="Web Development", description="Frontend Backend")

        # --- JOBS ---
        job1 = Job.objects.create(
            employer=employer1,
            category=cat1,
            title="Python Developer",
            description="Backend Django Developer required",
            location="Chennai",
            salary="3–5 LPA",
            posted_at=timezone.now(),
            last_date=date(2026, 1, 20)
        )

        job2 = Job.objects.create(
            employer=employer1,
            category=cat3,
            title="Frontend Developer",
            description="React Developer fresher",
            location="Remote",
            salary="2–4 LPA",
            posted_at=timezone.now(),
            last_date=date(2026, 1, 15)
        )

        job3 = Job.objects.create(
            employer=employer2,
            category=cat2,
            title="Data Analyst",
            description="Excel + Python + SQL",
            location="Bangalore",
            salary="4–6 LPA",
            posted_at=timezone.now(),
            last_date=date(2026, 1, 30)
        )

        # --- APPLICATIONS ---
        Application.objects.create(job=job1, seeker=seeker1, cover_letter="I love Python!")
        Application.objects.create(job=job1, seeker=seeker3, cover_letter="I want to join!")
        Application.objects.create(job=job3, seeker=seeker2, cover_letter="Good in SQL")
        Application.objects.create(job=job3, seeker=seeker1, cover_letter="Experienced in analysis")

        self.stdout.write(self.style.SUCCESS("Sample data created successfully!"))
