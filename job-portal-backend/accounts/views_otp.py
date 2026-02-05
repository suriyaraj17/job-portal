from rest_framework.views import APIView
from rest_framework.response import Response
from django.core.mail import send_mail
from django.conf import settings

from .models import EmailOTP
from .utils import generate_otp


class SendOTPView(APIView):
    def post(self, request):
        email = request.data.get("email")

        if not email:
            return Response({"error": "Email required"}, status=400)

        otp = generate_otp()
        EmailOTP.objects.create(email=email, otp=otp)

        send_mail(
            "OTP Verification",
            f"Your OTP is {otp}. Valid for 5 minutes.",
            settings.EMAIL_HOST_USER,
            [email],
        )

        return Response({"success": "OTP sent successfully ✅"})


class VerifyOTPView(APIView):
    def post(self, request):
        email = request.data.get("email")
        otp = request.data.get("otp")

        if not email or not otp:
            return Response({"error": "Email & OTP required"}, status=400)

        record = EmailOTP.objects.filter(email=email).order_by("-id").first()

        if not record:
            return Response({"error": "OTP not found"}, status=404)

        if not record.is_valid():
            return Response({"error": "OTP expired"}, status=400)

        if record.otp != otp:
            return Response({"error": "Invalid OTP"}, status=400)

        return Response({"success": "OTP verified ✅"})

        from rest_framework.views import APIView
from rest_framework.response import Response
from django.core.mail import send_mail
from django.conf import settings
from .models import EmailOTP
from .utils import generate_otp

class SendOTPView(APIView):
    def post(self, request):
        email = request.data.get("email")
        if not email:
            return Response({"error": "Email required"}, status=400)

        otp = generate_otp()

        try:
            EmailOTP.objects.create(email=email, otp=otp)
        except Exception as e:
            return Response({"error": f"DB Error: {e}"}, status=500)

        try:
            send_mail(
                "Job Portal OTP",
                f"Your OTP is {otp}. Valid for 5 minutes.",
                settings.EMAIL_HOST_USER,
                [email],
            )
        except Exception as e:
            return Response({"error": f"Mail Error: {e}"}, status=500)

        return Response({"success": "OTP sent successfully"})