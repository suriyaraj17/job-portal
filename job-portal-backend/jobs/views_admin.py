from rest_framework.response import Response
from rest_framework.decorators import api_view
from jobs.models import Job, JobCategory, Application
from accounts.models import EmployerProfile, JobSeekerProfile

@api_view(['GET'])
def admin_dashboard(request):
    data = {
        "total_categories": JobCategory.objects.count(),
        "total_employers": EmployerProfile.objects.count(),
        "total_jobseekers": JobSeekerProfile.objects.count(),
        "total_jobs": Job.objects.count(),
    }
    return Response(data)

@api_view(['POST'])
def update_page(request, title):
    page, created = Page.objects.get_or_create(title=title)
    page.content = request.data.get("content")
    page.save()
    return Response({"msg": "Saved"})
