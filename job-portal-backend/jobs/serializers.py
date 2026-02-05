from rest_framework import serializers
from .models import Job, JobCategory, Application
from accounts.serializers import UserSerializer
from accounts.models import JobSeekerProfile


# ✅ JOB CATEGORY
class JobCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = JobCategory
        fields = "__all__"

def get_employer_id(self, obj):
    return obj.employer.id if obj.employer else None

def get_company_name(self, obj):
        return obj.employer.company_name if obj.employer else ""    

# ✅ JOB SERIALIZER
class JobSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source="employer.company_name", read_only=True)
    company_logo = serializers.ImageField(source="employer.company_logo", read_only=True, allow_null=True)
    company_website = serializers.CharField(source="employer.website", read_only=True, allow_null=True)
    company_phone = serializers.CharField(source="employer.phone", read_only=True, allow_null=True)
    company_address = serializers.CharField(source="employer.address", read_only=True, allow_null=True)
    company_description = serializers.CharField(source="employer.description", read_only=True, allow_null=True)

    class Meta:
        model = Job
        fields = "__all__"
        read_only_fields = ["employer"]   # ⭐ THIS LINE FIXES IT


    def get_company_name(self, obj):
        return obj.employer.company_name if obj.employer else ""


    def get_company_logo(self, obj):
        request = self.context.get("request")
        if obj.employer and obj.employer.company_logo:
            return request.build_absolute_uri(obj.employer.company_logo.url)
        return None

    def get_company_website(self, obj):
        return getattr(obj.employer, "website", None)

    def get_company_phone(self, obj):
        return getattr(obj.employer, "phone", None)

    def get_company_address(self, obj):
        return getattr(obj.employer, "address", None)

    def get_company_description(self, obj):
        return getattr(obj.employer, "description", None)

    def get_category_name(self, obj):
        return obj.category.name if obj.category else ""

    def get_employer_id(self, obj):
        return obj.employer.id if obj.employer else None

# ✅ APPLICATION SERIALIZER
class SeekerMiniSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    user = UserSerializer(read_only=True)


class ApplicationSerializer(serializers.ModelSerializer):
    seeker = SeekerMiniSerializer(read_only=True)

    class Meta:
        model = Application
        fields = "__all__"


# ✅ Applicant Basic
class ApplicantBasicSerializer(serializers.ModelSerializer):
    user = serializers.CharField(source="user.username")

    class Meta:
        model = JobSeekerProfile
        fields = ["id", "user", "phone", "skills", "experience_years"]


class ApplicationWithSeekerSerializer(serializers.ModelSerializer):
    seeker = ApplicantBasicSerializer()

    class Meta:
        model = Application
        fields = ["id", "seeker", "cover_letter", "status", "applied_at"]


# ✅ Employer Message (request serializer)
class EmployerMessageSerializer(serializers.Serializer):
    application_id = serializers.IntegerField()
    message = serializers.CharField()