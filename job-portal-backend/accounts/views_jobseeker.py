from rest_framework.decorators import api_view
from rest_framework.response import Response
from jobs.models import Application

@api_view(['GET'])
def seeker_applied_jobs(request, seeker_id):
    apps = Application.objects.filter(seeker_id=seeker_id)
    return Response([
        {
            "job": a.job.title,
            "employer": a.job.employer.company_name,
            "status": a.status,
            "response_message": a.response_message
        }
        for a in apps
    ])
