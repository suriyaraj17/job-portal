from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth.models import User
from rest_framework.permissions import IsAuthenticated


from .models import EmployerProfile, JobSeekerProfile
from .serializers import (
    RegisterEmployerSerializer,
    RegisterSeekerSerializer,
    EmployerProfileSerializer,
    JobSeekerProfileSerializer,
)


# Employer Registration
class RegisterEmployerView(generics.CreateAPIView):
    serializer_class = RegisterEmployerSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        employer = serializer.save()   # returns EmployerProfile

        return Response(
            EmployerProfileSerializer(employer).data,
            status=201
        )


# Job-Seeker Registration
class RegisterSeekerView(generics.CreateAPIView):
    serializer_class = RegisterSeekerSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        seeker = serializer.save()
        return Response(
            JobSeekerProfileSerializer(seeker).data,
            status=201
        )

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .serializers import EmployerProfileSerializer
from .models import EmployerProfile


class EmployerDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    # ✅ THIS allows file uploads
    parser_classes = [MultiPartParser, FormParser]
    parser_classes = [MultiPartParser, FormParser, JSONParser] 

    def get(self, request):
        try:
            profile = request.user.employer_profile
        except EmployerProfile.DoesNotExist:
            return Response({"detail": "No employer profile"}, status=404)

        serializer = EmployerProfileSerializer(profile)
        return Response(serializer.data)

    def put(self, request):
        try:
            profile = request.user.employer_profile
        except EmployerProfile.DoesNotExist:
            return Response({"detail": "No employer profile"}, status=404)

        # ✅ partial=True allows updating only some fields
        serializer = EmployerProfileSerializer(
            profile,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        # 👇 This will show the REAL error in terminal if something fails
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Job-Seeker Profile
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import JobSeekerProfile
from .serializers import JobSeekerProfileSerializer

class SeekerDetailView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def get(self, request):
        profile = JobSeekerProfile.objects.get(user=request.user)
        serializer = JobSeekerProfileSerializer(profile)
        return Response(serializer.data)

    def put(self, request):
        profile = JobSeekerProfile.objects.get(user=request.user)
        serializer = JobSeekerProfileSerializer(
            profile,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=400)
    

class UploadSeekerProfilePic(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        seeker = request.user.seeker_profile
        if "profile_pic" not in request.FILES:
            return Response({"error": "No profile_pic uploaded"}, status=400)

        seeker.profile_pic = request.FILES["profile_pic"]
        seeker.save()
        return Response({"message": "Profile picture uploaded"})

class UploadResume(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        print("FILES RECEIVED:", request.FILES)   # <-- ADD HERE
        seeker = request.user.seeker_profile
        if "resume" not in request.FILES:
            return Response({"error": "No resume uploaded"}, status=400)

        seeker.resume = request.FILES["resume"]
        seeker.save()
        return Response({"message": "Resume uploaded"})

class UploadCompanyLogo(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        company = request.user.employer_profile
        file = request.FILES.get('company_logo')
        if not file:
            return Response({"error": "No file uploaded"}, status=400)
        company.company_logo = file
        company.save()
        return Response({"message": "Logo uploaded successfully"})


from rest_framework.views import APIView
from rest_framework.response import Response
from .models import EmailOTP
from .utils import generate_otp
from django.core.mail import send_mail
from django.conf import settings


class SendOTPView(APIView):

    def post(self, request):
        email = request.data.get("email")

        if not email:
            return Response({"error": "Email required"}, status=400)

        otp = generate_otp()

        EmailOTP.objects.create(email=email, otp=otp)

        send_mail(
            "Job Portal OTP Verification",
            f"Your OTP is {otp}. Valid for 5 minutes.",
            settings.EMAIL_HOST_USER,
            [email],
        )

        return Response({"success": "OTP sent to email"})

class VerifyOTPView(APIView):

    def post(self, request):
        email = request.data.get("email")
        otp = request.data.get("otp")

        if not email or not otp:
            return Response({"error": "Email & OTP required"}, status=400)

        try:
            record = EmailOTP.objects.filter(email=email).latest('id')
        except:
            return Response({"error": "OTP not requested"}, status=404)

        if not record.is_valid():
            return Response({"error": "OTP expired"}, status=400)

        if record.otp != otp:
            return Response({"error": "Invalid OTP"}, status=400)

        return Response({"success": "OTP verified"})

class ForgotPasswordRequest(APIView):

    def post(self, request):
        email = request.data.get("email")

        if not User.objects.filter(email=email).exists():
            return Response({"error": "User not found"}, status=404)

        otp = generate_otp()

        EmailOTP.objects.create(email=email, otp=otp)

        send_mail(
            "Password Reset OTP",
            f"Your OTP is {otp}",
            settings.EMAIL_HOST_USER,
            [email],
        )

        return Response({"success": "OTP sent for reset"})

class ForgotPasswordReset(APIView):

    def post(self, request):

        email = request.data.get("email")
        otp = request.data.get("otp")
        new_password = request.data.get("new_password")

        try:
            record = EmailOTP.objects.filter(email=email).latest('id')
        except:
            return Response({"error": "OTP not found"}, status=404)

        if record.otp != otp:
            return Response({"error": "Invalid OTP"}, status=400)

        user = User.objects.get(email=email)
        user.set_password(new_password)
        user.save()

        return Response({"success": "Password reset successful"})


from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import authenticate

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        old_password = request.data.get("old_password")
        new_password = request.data.get("new_password")

        if not old_password or not new_password:
            return Response(
                {"error": "Old password and new password are required"},
                status=400
            )

        if not user.check_password(old_password):
            return Response(
                {"error": "Old password is incorrect"},
                status=400
            )

        user.set_password(new_password)
        user.save()

        return Response({"success": "Password updated successfully"})
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from .models import EmailOTP

class ChangeEmailView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        new_email = request.data.get("new_email")
        otp = request.data.get("otp")

        if not new_email or not otp:
            return Response({"error": "new_email and otp are required"}, status=400)

        # ✅ Check if email already used
        if User.objects.filter(email=new_email).exists():
            return Response({"error": "Email already exists"}, status=400)

        # ✅ Get latest OTP record for this email
        try:
            record = EmailOTP.objects.filter(email=new_email).latest("id")
        except EmailOTP.DoesNotExist:
            return Response({"error": "OTP not requested for this email"}, status=404)

        # ✅ Validate OTP expiry
        if not record.is_valid():
            return Response({"error": "OTP expired"}, status=400)

        # ✅ Validate OTP value
        if record.otp != otp:
            return Response({"error": "Invalid OTP"}, status=400)

        # ✅ Update BOTH username + email
        user = request.user
        user.email = new_email
        user.username = new_email
        user.save()

        return Response({"success": "Email updated successfully ✅", "email": new_email})

import random
from django.contrib.auth.models import User
from django.core.mail import send_mail
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import PasswordResetOTP
from .serializers import RequestOTPSerializer, VerifyOTPSerializer


@api_view(["POST"])
def request_password_reset_otp(request):
    serializer = RequestOTPSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=400)

    email = serializer.validated_data["email"]

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({"error": "User with this email does not exist"}, status=404)

    otp = str(random.randint(100000, 999999))

    PasswordResetOTP.objects.filter(user=user).delete()
    PasswordResetOTP.objects.create(user=user, otp=otp)

    send_mail(
        subject="Password Reset OTP",
        message=f"Your OTP is {otp}. It is valid for 5 minutes.",
        from_email=None,
        recipient_list=[email],
    )

    return Response({"message": "OTP sent to email"})
    

@api_view(["POST"])
def verify_password_reset_otp(request):
    serializer = VerifyOTPSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=400)

    email = serializer.validated_data["email"]
    otp = serializer.validated_data["otp"]
    new_password = serializer.validated_data["new_password"]

    try:
        user = User.objects.get(email=email)
        record = PasswordResetOTP.objects.get(user=user, otp=otp)
    except (User.DoesNotExist, PasswordResetOTP.DoesNotExist):
        return Response({"error": "Invalid OTP"}, status=400)

    if record.is_expired():
        record.delete()
        return Response({"error": "OTP expired"}, status=400)

    user.set_password(new_password)
    user.save()
    record.delete()

    return Response({"message": "Password reset successful"})        