from django.urls import path
from .views import (
    JobCategoryListCreateView, JobCategoryDetailView,
    EmployerJobListCreateView, EmployerJobDetailView,
    JobListView, ApplyJobView,
    ApplicantsForJobView, JobSearchView,
    get_page, seeker_applied_jobs,
    employer_send_message, candidate_messages,
    employer_public_profile, update_application_status,
    JobDetailView,
    my_applied_job_ids
)
from .views_admin import admin_dashboard, update_page
from .views_employer import employer_candidates, update_app_status, employer_reports, employer_view_candidate_profile


urlpatterns = [
    # Categories
    path("categories/", JobCategoryListCreateView.as_view()),
    path("categories/<int:pk>/", JobCategoryDetailView.as_view()),

    # Employer job management
    path("employer/jobs/", EmployerJobListCreateView.as_view()),
    path("employer/jobs/<int:pk>/", EmployerJobDetailView.as_view()),

    # Public jobs
    path("", JobListView.as_view()),
    path("<int:pk>/", JobDetailView.as_view(), name="job-detail"),

    # Applications
    path("<int:job_id>/apply/", ApplyJobView.as_view()),
    path("applications/", seeker_applied_jobs),

    # Employer views applicants
    path("<int:job_id>/applicants/", ApplicantsForJobView.as_view()),

    # Search
    path("search/", JobSearchView.as_view(), name="job-search"),

    # CMS Pages
    path("page/<str:title>/", get_page),

    # Admin
    path("admin/dashboard/", admin_dashboard),
    path("admin/page/<str:title>/", update_page),

    # Employer features
    path("employer/<int:employer_id>/candidates/", employer_candidates),
    path("employer/application/<int:app_id>/update/", update_app_status),
    path("employer/<int:employer_id>/reports/", employer_reports),
    path("employer/candidate/<int:seeker_id>/", employer_view_candidate_profile),
    path("employer/<int:employer_id>/profile/", employer_public_profile),

    # Messaging
    path("employer/send-message/", employer_send_message),
    path("candidate/messages/", candidate_messages),

    # Application status update
    path("applications/<int:application_id>/status/", update_application_status),

    path("applied-job-ids/", my_applied_job_ids),
]