from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.exceptions import AuthenticationFailed
from .models import EmployerProfile, JobSeekerProfile

# =========================
# USER SERIALIZER
# =========================
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "email", "first_name", "last_name")


# =========================
# EMPLOYER PROFILE SERIALIZER
# =========================
class EmployerProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    company_logo = serializers.SerializerMethodField()

    class Meta:
        model = EmployerProfile
        fields = "_all_"

    def get_company_logo(self, obj):
        if obj.company_logo:
            return obj.company_logo.url
        return None

# =========================
# JOB SEEKER PROFILE SERIALIZER
# =========================
class JobSeekerProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    resume = serializers.SerializerMethodField()

    class Meta:
        model = JobSeekerProfile
        fields = "_all_"

    def get_resume(self, obj):
        if obj.resume:
            return obj.resume.url
        return None


# =========================
# REGISTER EMPLOYER
# =========================

from rest_framework import serializers
from django.contrib.auth.models import User
from .models import EmployerProfile

class RegisterEmployerSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(write_only=True)
    password = serializers.CharField(write_only=True)

    class Meta:
        model = EmployerProfile
        fields = ["company_name", "email", "password"]

    def create(self, validated_data):
        email = validated_data.pop("email")
        password = validated_data.pop("password")

        # ✅ Create User
        user = User.objects.create_user(
            username=email,
            email=email,
            password=password
        )

        # ✅ Create Employer Profile
        employer = EmployerProfile.objects.create(
            user=user,
            **validated_data
        )

        return employer


# =========================
# REGISTER SEEKER
# =========================
class RegisterSeekerSerializer(serializers.Serializer):
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def create(self, validated_data):
        email = validated_data["email"]

        user = User.objects.create_user(
            username=email,
            email=email,
            password=validated_data["password"],
            first_name=validated_data["first_name"],
            last_name=validated_data["last_name"],
        )

        seeker = JobSeekerProfile.objects.create(user=user)
        return seeker


from rest_framework import serializers

class RequestOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()

class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)
    new_password = serializers.CharField(min_length=6)