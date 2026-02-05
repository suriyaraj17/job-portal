from rest_framework import generics, permissions, filters
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.decorators import api_view, permission_classes
from rest_framework.views import APIView

from .models import JobCategory, Job, Application, Page, EmployerMessage
from .serializers import (
    JobCategorySerializer,
    JobSerializer,
    ApplicationSerializer
)

from accounts.models import EmployerProfile, JobSeekerProfile


# =========================
# JOB CATEGORY
# =========================

class JobCategoryListCreateView(generics.ListCreateAPIView):
    queryset = JobCategory.objects.all()
    serializer_class = JobCategorySerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["name"]

    def get_permissions(self):
        if self.request.method == "GET":
            return [AllowAny()]
        return [IsAdminUser()]


class JobCategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = JobCategory.objects.all()
    serializer_class = JobCategorySerializer
    permission_classes = [IsAdminUser]


# =========================
# EMPLOYER JOB MANAGEMENT
# =========================

# EmployerJobListCreateView
class EmployerJobListCreateView(generics.ListCreateAPIView):
    serializer_class = JobSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if hasattr(self.request.user, "employer_profile"):
            return Job.objects.filter(employer=self.request.user.employer_profile)
        return Job.objects.none()

    def get_serializer_context(self):
        return {"request": self.request}

    def perform_create(self, serializer):
        serializer.save(employer=self.request.user.employer_profile)

# EmployerJobDetailView
class EmployerJobDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = JobSerializer
    permission_classes =  [AllowAny]

    def get_queryset(self):
        if hasattr(self.request.user, "employer_profile"):
            return Job.objects.filter(employer=self.request.user.employer_profile)
        return Job.objects.none()
   


class JobListView(generics.ListAPIView):
    queryset = Job.objects.filter(is_active=True)
    serializer_class = JobSerializer
    permission_classes = [AllowAny]

    def get_serializer_context(self):
        return {"request": self.request}

from rest_framework.generics import RetrieveAPIView
from rest_framework.permissions import AllowAny
from .models import Job
from .serializers import JobSerializer

class JobDetailView(RetrieveAPIView):
    serializer_class = JobSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Job.objects.all()

    def get_serializer_context(self):
        return {"request": self.request}  # ✅ allow all jobs to be viewed


# =========================
# APPLY TO JOB
# =========================

class ApplyJobView(generics.CreateAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request, job_id):
        # Ensure logged user is seeker
        if not hasattr(request.user, "seeker_profile"):
            return Response({"error": "Only job seekers can apply"}, status=403)

        seeker = request.user.seeker_profile

        try:
            job = Job.objects.get(id=job_id, is_active=True)
        except Job.DoesNotExist:
            return Response({"error": "Job not found"}, status=404)

        # Check duplicate
        if Application.objects.filter(seeker=seeker, job=job).exists():
            return Response({"error": "Already applied"}, status=400)

        application = Application.objects.create(
            seeker=seeker,
            job=job,
            cover_letter=request.data.get("cover_letter", "")
        )

        return Response({
            "message": "Application submitted",
            "application_id": application.id
        }, status=201)


# =========================
# EMPLOYER – VIEW APPLICANTS
# =========================

class ApplicantsForJobView(generics.ListAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        job_id = self.kwargs["job_id"]
        if hasattr(self.request.user, "employer_profile"):
            return Application.objects.filter(
                job_id=job_id,
                job__employer=self.request.user.employer_profile
            )
        return Application.objects.none()


# =========================
# JOB SEARCH
# =========================

class JobSearchView(APIView):
    def get(self, request):
        query = request.GET.get("q", "")
        jobs = Job.objects.filter(title__icontains=query) if query else Job.objects.all()
        serializer = JobSerializer(jobs, many=True)
        return Response(serializer.data)


# =========================
# STATIC PAGES (ABOUT, ETC.)
# =========================

@api_view(['GET'])
def get_page(request, title):
    try:
        page = Page.objects.get(title=title)
        return Response({"title": page.title, "content": page.content})
    except Page.DoesNotExist:
        return Response({"error": "Page not found"}, status=404)


# =========================
# SEEKER APPLIED JOBS (FIXED)
# =========================

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Application

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def seeker_applied_jobs(request):
    seeker = request.user.seeker_profile

    apps = Application.objects.filter(seeker=seeker).select_related("job", "job__employer")

    data = []
    for a in apps:
        last_message = EmployerMessage.objects.filter(
            application=a
        ).order_by('-sent_at').first()

        data.append({
            "application_id": a.id,
            "job_id": a.job.id,  # ✅ ADD THIS
            "job_title": a.job.title,
            "company_name": a.job.employer.company_name,
            "status": a.status,
            "last_message": last_message.message if last_message else None,
        })

    return Response(data)


# =========================
# EMPLOYER SEND MESSAGE
# =========================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def employer_send_message(request):
    application_id = request.data.get("application_id")
    message_text = request.data.get("message")

    if not application_id or not message_text:
        return Response({"error": "application_id and message required"}, status=400)

    try:
        application = Application.objects.select_related("job", "seeker").get(id=application_id)
    except Application.DoesNotExist:
        return Response({"error": "Invalid application_id"}, status=404)

    if not hasattr(request.user, "employer_profile"):
        return Response({"error": "Only employers can send messages"}, status=403)

    employer = request.user.employer_profile

    if application.job.employer != employer:
        return Response({"error": "Not authorized"}, status=403)

    EmployerMessage.objects.create(
        sender=employer,
        receiver=application.seeker,
        application=application,
        message=message_text
    )

    return Response({"success": "Message sent successfully"})


# =========================
# SEEKER VIEW MESSAGES
# =========================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def candidate_messages(request):
    try:
        seeker = request.user.seeker_profile
    except JobSeekerProfile.DoesNotExist:
        return Response({"error": "Jobseeker not found"}, status=404)

    messages = EmployerMessage.objects.filter(receiver=seeker).order_by("-sent_at")

    return Response([
        {
            "from_employer": m.sender.company_name,
            "job": m.application.job.title,
            "application_id": m.application.id,
            "message": m.message,
            "sent_at": m.sent_at,
        }
        for m in messages
    ])


# =========================
# PUBLIC EMPLOYER PROFILE
# =========================

@api_view(["GET"])
def employer_public_profile(request, employer_id):
    try:
        employer = EmployerProfile.objects.get(id=employer_id)
    except EmployerProfile.DoesNotExist:
        return Response({"error": "Employer not found"}, status=404)

    jobs = Job.objects.filter(employer=employer, is_active=True)

    return Response({
        "company_name": employer.company_name,
        "address": employer.address,
        "phone": employer.phone,
        "company_logo": request.build_absolute_uri(employer.company_logo.url)
        if employer.company_logo else None,
        "jobs": [{"id": job.id, "title": job.title, "location": job.location} for job in jobs]
    })


# =========================
# EMPLOYER UPDATE APPLICATION STATUS
# =========================

@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_application_status(request, application_id):
    try:
        application = Application.objects.select_related("job").get(id=application_id)
    except Application.DoesNotExist:
        return Response({"error": "Application not found"}, status=404)

    if application.job.employer != request.user.employer_profile:
        return Response({"error": "Unauthorized"}, status=403)

    status_value = request.data.get("status")

    if status_value not in ["shortlisted", "rejected", "hired"]:
        return Response({"error": "Invalid status"}, status=400)

    application.status = status_value
    application.save()

    return Response({"success": "Status updated", "status": application.status})

# applied jobs
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Application

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_applied_job_ids(request):
    if not hasattr(request.user, "seeker_profile"):
        return Response([], status=200)

    seeker = request.user.seeker_profile
    job_ids = Application.objects.filter(seeker=seeker).values_list("job_id", flat=True)

    return Response(list(job_ids))