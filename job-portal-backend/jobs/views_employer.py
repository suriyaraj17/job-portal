from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Application, Job

@api_view(['GET'])
def employer_candidates(request, employer_id):
    apps = Application.objects.filter(job__employer_id=employer_id)
    return Response([
        {
            "job_title": a.job.title,
            "seeker_name": a.seeker.user.username,
            "status": a.status,
            "cover_letter": a.cover_letter
        }
        for a in apps
    ])

@api_view(['POST'])
def update_app_status(request, app_id):
    app = Application.objects.get(id=app_id)
    app.status = request.data.get("status")
    app.response_message = request.data.get("message")
    app.save()
    return Response({"msg": "Updated successfully"})

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Count
from accounts.models import EmployerProfile
from jobs.models import Job, Application
# new
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def employer_reports(request, employer_id):
    # Validate employer
    try:
        employer = EmployerProfile.objects.get(id=employer_id)
    except EmployerProfile.DoesNotExist:
        return Response({"error": "Employer not found"}, status=404)

    # Security check
    if request.user != employer.user:
        return Response({"error": "Unauthorized access"}, status=403)

    # Jobs with application counts
    jobs = Job.objects.filter(employer=employer).annotate(
        total_applications=Count("applications")
    )

    data = []
    for job in jobs:
        data.append({
            "job_id": job.id,
            "job_title": job.title,
            "total_applications": job.total_applications
        })

    return Response({
        "employer": employer.company_name,
        "report": data
    })


from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from jobs.models import Application
from accounts.models import JobSeekerProfile

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def employer_view_candidate_profile(request, seeker_id):
    try:
        seeker = JobSeekerProfile.objects.select_related("user").get(id=seeker_id)
    except JobSeekerProfile.DoesNotExist:
        return Response({"error": "Candidate not found"}, status=404)

    user = seeker.user

    full_name = f"{user.first_name} {user.last_name}".strip()
    if not full_name:
        full_name = user.email  # fallback only if name missing

    return Response({
        "name": full_name,
        "email": user.email,
        "phone": seeker.phone,
        "skills": seeker.skills,
        "experience_years": seeker.experience_years,
        "college_name": seeker.college_name,
        "degree": seeker.degree,
        "cgpa": seeker.cgpa,
        "passed_out_year": seeker.passed_out_year,
        "profile_pic": seeker.profile_pic.url if seeker.profile_pic else None,
        "resume": seeker.resume.url if seeker.resume else None,
    })