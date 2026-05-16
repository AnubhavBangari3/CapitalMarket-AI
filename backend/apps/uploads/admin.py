from django.contrib import admin
from . models import UploadedSwiftFile,SWIFTMessage,Trade,SSIInstruction,SecurityHolding,CashBalance
# Register your models here.

admin.site.register(UploadedSwiftFile)
admin.site.register(SWIFTMessage)
admin.site.register(Trade)
admin.site.register(SSIInstruction)
admin.site.register(SecurityHolding)
admin.site.register(CashBalance)
