import { 
  PatientRecord, 
  QueueToken, 
  ClinicVisit, 
  Invoice, 
  PaymentRecord, 
  PrescriptionRecord, 
  StaffUser, 
  FeeApprovalRecord, 
  MedicineRecord, 
  Doctor 
} from '../types';

export const SEED_PATIENTS: PatientRecord[] = [
  {
    "id": "PAT-2026-000001",
    "opNumber": "OP-2026-00001",
    "name": "Customer 1",
    "phone": "9633746591",
    "age": 22,
    "gender": "Male",
    "dateOfBirth": "2004-01-01",
    "assignedDoctorId": "staff-1792653030970",
    "assignedDoctorName": "Dr. DOCTOR TEST",
    "firstVisitDate": "2026-11-05",
    "lastVisit": "2026-11-09",
    "totalVisits": 4,
    "currentTreatment": "test 2",
    "status": "Active Treatment",
    "outstandingBalance": 0,
    "dentalChart": [
      {
        "toothNumber": 13,
        "type": "adult",
        "condition": "Root Canal",
        "surfaces": {
          "buccal": "Caries",
          "lingual": "Caries"
        },
        "notes": "TEST ",
        "treatmentStatus": "Proposed",
        "treatmentCode": "R"
      },
      {
        "toothNumber": 31,
        "type": "adult",
        "condition": "Crown",
        "surfaces": {
          "occlusal": "Filling"
        },
        "notes": "",
        "treatmentCode": "CR",
        "treatmentStatus": "Proposed"
      }
    ],
    "clinicalNotes": [
      {
        "id": "cn-1794210887133",
        "patientId": "PAT-2026-000001",
        "visitId": "VIS-2026-00003",
        "date": "2026-11-09",
        "doctorName": "DOCTOR TEST",
        "chiefComplaint": "test 2",
        "clinicalFindings": "Examination complete.",
        "diagnosis": "test",
        "treatmentPerformed": "test 2",
        "doctorNotes": "test 2",
        "nextVisitInstructions": "Return on 2026-12-05: Review"
      },
      {
        "id": "cn-1794210863460",
        "patientId": "PAT-2026-000001",
        "date": "2026-11-09",
        "doctorName": "Dr. DOCTOR TEST",
        "chiefComplaint": "Routine scaling and stain removal",
        "clinicalFindings": "Supragingival calculus and plaque, generalized mild gingivitis",
        "diagnosis": "Chronic Marginal Gingivitis",
        "treatmentPerformed": "Full mouth ultrasonic scaling and polishing performed",
        "doctorNotes": "Advised warm saline rinses and soft-bristled toothbrush twice daily.",
        "nextVisitInstructions": ""
      },
      {
        "id": "cn-1794134806248",
        "patientId": "PAT-2026-000001",
        "date": "2026-11-08",
        "doctorName": "Dr. DOCTOR TEST",
        "chiefComplaint": "Sensitivity to cold and food entrapment",
        "clinicalFindings": "Occlusal dental caries into enamel and dentin without pulpal involvement",
        "diagnosis": "Class I Occlusal Dental Caries",
        "treatmentPerformed": "Excavation of caries, 37% phosphoric acid etching, bonding agent, and light-cured composite resin placed and polished.",
        "doctorNotes": "Checked occlusion with articulating paper. No interference.",
        "nextVisitInstructions": ""
      },
      {
        "id": "cn-1794126642568",
        "patientId": "PAT-2026-000001",
        "date": "2026-11-08",
        "doctorName": "Dr. DOCTOR TEST",
        "chiefComplaint": "Severe throbbing spontaneous nocturnal toothache",
        "clinicalFindings": "Extensive carious involvement into pulp chamber, severe tenderness to vertical percussion",
        "diagnosis": "Acute Irreversible Pulpitis with Symptomatic Apical Periodontitis",
        "treatmentPerformed": "Access cavity prepared under 2% lignocaine with 1:80000 adrenaline. Working length verified via apex locator. Biomechanical prep up to 25/04. Calcium hydroxide intra-canal dressing placed. Temporary Cavit seal.",
        "doctorNotes": "Rx: Amoxicillin 500mg TID x 5 days + Ibuprofen 400mg TID x 3 days. Return in 7 days for obturation.",
        "nextVisitInstructions": ""
      }
    ],
    "treatmentPlans": [
      {
        "id": "tp-1794210768794",
        "patientId": "PAT-2026-000001",
        "toothNumbers": [
          31
        ],
        "diagnosis": "Dental Caries / Defective Tooth Margin",
        "procedure": "Composite Resin Restoration (Filling)",
        "priority": "High",
        "estimatedCost": 1300,
        "status": "Proposed",
        "doctorId": "staff-1792653030970",
        "doctorName": "Dr. DOCTOR TEST",
        "createdAt": "2026-11-09T07:52:48.794Z"
      },
      {
        "id": "tp-1794126367299",
        "patientId": "PAT-2026-000001",
        "toothNumbers": [
          13
        ],
        "diagnosis": "Deep Dental Caries with Irreversible Pulpitis",
        "procedure": "Root Canal Therapy",
        "priority": "High",
        "estimatedCost": 3500,
        "status": "Proposed",
        "doctorId": "staff-1792653030970",
        "doctorName": "Dr. DOCTOR TEST",
        "notes": "TEST ",
        "prostheticDesign": {
          "restorationType": "Crown",
          "material": "Zirconia",
          "shade": "A2",
          "ponticDesign": "Modified Ridge",
          "collarDesign": "Lingual Collar",
          "marginDesign": "Shoulder / Chamfer",
          "labInstructions": "Custom shade A2 match for Tooth #13"
        },
        "createdAt": "2026-11-08T08:26:07.299Z"
      }
    ],
    "visits": [
      {
        "id": "vis-1794210863460",
        "patientId": "PAT-2026-000001",
        "date": "2026-11-09",
        "doctorName": "Dr. DOCTOR TEST",
        "chiefComplaint": "Routine scaling and stain removal",
        "clinicalFindings": "Supragingival calculus and plaque, generalized mild gingivitis",
        "diagnosis": "Chronic Marginal Gingivitis",
        "treatment": "Full mouth ultrasonic scaling and polishing performed",
        "doctorNotes": "Advised warm saline rinses and soft-bristled toothbrush twice daily.",
        "followUp": "",
        "timelineType": "Treatment"
      },
      {
        "id": "VIS-2026-00003",
        "patientId": "PAT-2026-000001",
        "patientName": "Customer 1",
        "opNumber": "OP-2026-00001",
        "patientPhone": "9633746591",
        "doctorId": "staff-1792653030970",
        "doctorName": "Dr. DOCTOR TEST",
        "visitDate": "2026-11-09",
        "checkInTime": "11:26 am",
        "status": "In Consultation",
        "tokenId": "W-003",
        "priority": "Normal",
        "reasonForVisit": "Severe throbbing toothache",
        "timeline": [
          {
            "time": "11:26 am",
            "event": "Patient Checked In. Token W-003 generated by TEST DESK.",
            "actor": "TEST DESK"
          },
          {
            "time": "11:26 am",
            "event": "Token W-003 Called by DOCTOR TEST. Directed to consultation suite.",
            "actor": "DOCTOR TEST"
          },
          {
            "time": "11:26 am",
            "event": "Consultation Started with Dr. DOCTOR TEST. Examination underway.",
            "actor": "DOCTOR TEST"
          }
        ],
        "calledTime": "11:26 am",
        "chairId": "chair-1",
        "chairName": "Dental Operatory 1 (Main Surgery)",
        "consultationStartTime": "11:26 am",
        "feeApproval": {
          "id": "FA-2026-0002",
          "visitId": "VIS-2026-00003",
          "patientId": "PAT-2026-000001",
          "patientName": "Customer 1",
          "patientOpNumber": "OP-2026-00001",
          "doctorId": "staff-1792653030970",
          "doctorName": "Dr. DOCTOR TEST",
          "consultationFee": 0,
          "items": [
            {
              "id": "tp-item-0",
              "description": "Composite Resin Restoration (Filling)",
              "quantity": 1,
              "unitPrice": 1300,
              "total": 1300
            }
          ],
          "subtotal": 1300,
          "discountType": "amount",
          "discountValue": 0,
          "discountAmount": 0,
          "discountReason": "None",
          "authorizingDoctorId": "staff-1792653030970",
          "authorizingDoctorName": "DOCTOR TEST",
          "tax": 0,
          "finalPayable": 1300,
          "approvedAt": "2026-11-09T07:53:51.218Z",
          "status": "Approved",
          "invoiceId": "INV-2026-0002"
        },
        "invoiceId": "INV-2026-0002"
      },
      {
        "id": "vis-1794134806248",
        "patientId": "PAT-2026-000001",
        "date": "2026-11-08",
        "doctorName": "Dr. DOCTOR TEST",
        "chiefComplaint": "Sensitivity to cold and food entrapment",
        "clinicalFindings": "Occlusal dental caries into enamel and dentin without pulpal involvement",
        "diagnosis": "Class I Occlusal Dental Caries",
        "treatment": "Excavation of caries, 37% phosphoric acid etching, bonding agent, and light-cured composite resin placed and polished.",
        "doctorNotes": "Checked occlusion with articulating paper. No interference.",
        "followUp": "",
        "timelineType": "Treatment"
      },
      {
        "id": "VIS-2026-00001",
        "patientId": "PAT-2026-000001",
        "patientName": "Customer 1",
        "opNumber": "OP-2026-00001",
        "patientPhone": "9633746591",
        "doctorId": "staff-1792653030970",
        "doctorName": "Dr. DOCTOR TEST",
        "visitDate": "2026-11-07",
        "checkInTime": "11:05 am",
        "status": "In Consultation",
        "tokenId": "W-001",
        "priority": "Normal",
        "reasonForVisit": "Initial Consultation & Examination",
        "timeline": [
          {
            "time": "11:05 am",
            "event": "Patient Checked In. Token W-001 generated by TEST DESK.",
            "actor": "TEST DESK"
          },
          {
            "time": "11:06 am",
            "event": "Token W-001 Called by DOCTOR TEST. Directed to consultation suite.",
            "actor": "DOCTOR TEST"
          },
          {
            "time": "11:07 am",
            "event": "Consultation Started with Dr. DOCTOR TEST. Examination underway.",
            "actor": "DOCTOR TEST"
          }
        ],
        "calledTime": "11:06 am",
        "chairId": "chair-1",
        "chairName": "Dental Operatory 1 (Main Surgery)",
        "consultationStartTime": "11:07 am",
        "prescriptionRecord": {
          "id": "RX-2026-0002",
          "visitId": "VIS-2026-00001",
          "patientId": "PAT-2026-000001",
          "patientName": "Customer 1",
          "patientOpNumber": "OP-2026-00001",
          "patientAge": 22,
          "patientGender": "Male",
          "doctorId": "staff-1792653030970",
          "doctorName": "DOCTOR TEST",
          "doctorTitle": "BDS, MDS — Dental Specialist & Surgeon",
          "clinicName": "Shriya Multispeciality Dental Clinic",
          "clinicAddress": "402, Green Glen Layout, Outer Ring Road, Bellandur, Bengaluru",
          "clinicPhone": "+91 98888 77777",
          "date": "2026-11-08",
          "diagnosis": "Severe throbbing toothache",
          "items": [
            {
              "id": "rx-1794130154875",
              "medicine": "Amoxicillin + Clavulanate (Augmentin)",
              "dosage": "625mg",
              "route": "Oral",
              "frequency": "BD",
              "duration": "5 days",
              "instructions": "After food"
            }
          ],
          "doctorNotes": "",
          "followUpDate": "2026-11-14",
          "createdAt": "2026-11-08T09:29:59.721Z"
        },
        "prescriptions": "Amoxicillin + Clavulanate (Augmentin) 625mg (BD)",
        "feeApproval": {
          "id": "FA-2026-0001",
          "visitId": "VIS-2026-00001",
          "patientId": "PAT-2026-000001",
          "patientName": "Customer 1",
          "patientOpNumber": "OP-2026-00001",
          "doctorId": "staff-1792653030970",
          "doctorName": "Dr. DOCTOR TEST",
          "consultationFee": 0,
          "items": [
            {
              "id": "tp-item-0",
              "description": "Root Canal Therapy",
              "quantity": 1,
              "unitPrice": 3500,
              "total": 3500
            }
          ],
          "subtotal": 3500,
          "discountType": "amount",
          "discountValue": 0,
          "discountAmount": 0,
          "discountReason": "None",
          "authorizingDoctorId": "staff-1792653030970",
          "authorizingDoctorName": "DOCTOR TEST",
          "tax": 0,
          "finalPayable": 3500,
          "approvedAt": "2026-11-08T09:57:27.888Z",
          "status": "Approved",
          "invoiceId": "INV-2026-0001"
        },
        "invoiceId": "INV-2026-0001"
      },
      {
        "id": "vis-1794126642568",
        "patientId": "PAT-2026-000001",
        "date": "2026-11-08",
        "doctorName": "Dr. DOCTOR TEST",
        "chiefComplaint": "Severe throbbing spontaneous nocturnal toothache",
        "clinicalFindings": "Extensive carious involvement into pulp chamber, severe tenderness to vertical percussion",
        "diagnosis": "Acute Irreversible Pulpitis with Symptomatic Apical Periodontitis",
        "treatment": "Access cavity prepared under 2% lignocaine with 1:80000 adrenaline. Working length verified via apex locator. Biomechanical prep up to 25/04. Calcium hydroxide intra-canal dressing placed. Temporary Cavit seal.",
        "doctorNotes": "Rx: Amoxicillin 500mg TID x 5 days + Ibuprofen 400mg TID x 3 days. Return in 7 days for obturation.",
        "followUp": "",
        "timelineType": "Treatment"
      }
    ],
    "secondaryPhone": null,
    "email": null,
    "address": null,
    "referralSource": null,
    "registeredBy": null,
    "emergencyContact": {
      "name": "",
      "phone": "",
      "relation": ""
    },
    "upcomingAppointmentDate": "2026-12-05",
    "caseSheetCompleted": true,
    "caseSheetCompletedAt": "2026-11-08T07:54:49.283Z",
    "medicalHistory": {
      "allergies": [
        "Sulfa Drugs"
      ],
      "conditions": [
        "Diabetes Mellitus"
      ],
      "hasDiabetes": true,
      "hasBloodPressure": false,
      "hasHeartConditions": false,
      "hasAsthma": false,
      "hasBleedingDisorders": false,
      "currentMedications": [],
      "previousSurgeries": [],
      "otherNotes": ""
    },
    "dentalHistory": {
      "currentComplaint": "Severe throbbing toothache",
      "historyOfPresentIllness": "Pain started 3 days ago with sudden onset.",
      "caseSheetCompleted": true,
      "completedAt": "2026-11-08T07:54:49.283Z",
      "lastDentalVisit": "",
      "previousDentist": "",
      "previousTreatments": [],
      "habits": [],
      "notes": ""
    },
    "allergies": [
      "Sulfa Drugs"
    ],
    "invoices": [
      {
        "id": "INV-2026-0002",
        "patientId": "PAT-2026-000001",
        "patientName": "Customer 1",
        "patientOpNumber": "OP-2026-00001",
        "doctorName": "Dr. DOCTOR TEST",
        "date": "2026-11-09",
        "feeApprovalId": "FA-2026-0002",
        "approvedBy": "DOCTOR TEST",
        "discountReason": "None",
        "items": [
          {
            "id": "tp-item-0",
            "description": "Composite Resin Restoration (Filling)",
            "quantity": 1,
            "unitPrice": 1300,
            "total": 1300
          }
        ],
        "subtotal": 1300,
        "discount": 0,
        "tax": 0,
        "total": 1300,
        "paid": 1300,
        "balance": 0,
        "status": "Paid",
        "payments": [
          {
            "id": "PAY-2026-0003",
            "receiptNumber": "REC-2026-0003",
            "invoiceId": "INV-2026-0002",
            "patientId": "PAT-2026-000001",
            "patientName": "Customer 1",
            "doctorName": "Dr. DOCTOR TEST",
            "amount": 1300,
            "paymentMethod": "Cash",
            "receivedBy": "TEST DESK",
            "date": "2026-11-09",
            "time": "02:02 pm",
            "notes": "Payment collected at checkout by TEST DESK",
            "status": "Successful"
          }
        ],
        "paymentMethod": "Cash"
      },
      {
        "id": "INV-2026-0001",
        "patientId": "PAT-2026-000001",
        "patientName": "Customer 1",
        "patientOpNumber": "OP-2026-00001",
        "doctorName": "Dr. DOCTOR TEST",
        "date": "2026-11-08",
        "feeApprovalId": "FA-2026-0001",
        "approvedBy": "DOCTOR TEST",
        "discountReason": "None",
        "items": [
          {
            "id": "tp-item-0",
            "description": "Root Canal Therapy",
            "quantity": 1,
            "unitPrice": 3500,
            "total": 3500
          }
        ],
        "subtotal": 3500,
        "discount": 0,
        "tax": 0,
        "total": 3500,
        "paid": 3500,
        "balance": 0,
        "status": "Paid",
        "payments": [
          {
            "id": "PAY-2026-0001",
            "receiptNumber": "REC-2026-0001",
            "invoiceId": "INV-2026-0001",
            "patientId": "PAT-2026-000001",
            "patientName": "Customer 1",
            "doctorName": "Dr. DOCTOR TEST",
            "amount": 3500,
            "paymentMethod": "Cash",
            "receivedBy": "TEST DESK",
            "date": "2026-11-08",
            "time": "04:17 pm",
            "notes": "Payment collected at checkout by TEST DESK",
            "status": "Successful"
          }
        ]
      }
    ],
    "recentTreatments": [],
    "diagnoses": [],
    "treatmentSessions": [],
    "labOrders": [],
    "documents": [],
    "followUps": [
      {
        "id": "fu-1794210887134",
        "patientId": "PAT-2026-000001",
        "date": "2026-12-05",
        "doctorName": "DOCTOR TEST",
        "reason": "test",
        "treatment": "test 2",
        "notes": "test 2",
        "status": "Scheduled"
      }
    ],
    "prescriptions": [
      {
        "id": "RX-2026-0002",
        "visitId": "VIS-2026-00001",
        "patientId": "PAT-2026-000001",
        "patientName": "Customer 1",
        "patientOpNumber": "OP-2026-00001",
        "patientAge": 22,
        "patientGender": "Male",
        "doctorId": "staff-1792653030970",
        "doctorName": "DOCTOR TEST",
        "doctorTitle": "BDS, MDS — Dental Specialist & Surgeon",
        "clinicName": "Shriya Multispeciality Dental Clinic",
        "clinicAddress": "402, Green Glen Layout, Outer Ring Road, Bellandur, Bengaluru",
        "clinicPhone": "+91 98888 77777",
        "date": "2026-11-08",
        "diagnosis": "Severe throbbing toothache",
        "items": [
          {
            "id": "rx-1794130154875",
            "medicine": "Amoxicillin + Clavulanate (Augmentin)",
            "dosage": "625mg",
            "route": "Oral",
            "frequency": "BD",
            "duration": "5 days",
            "instructions": "After food"
          }
        ],
        "doctorNotes": "",
        "followUpDate": "2026-11-14",
        "createdAt": "2026-11-08T09:29:59.721Z"
      }
    ],
    "feeApprovals": [
      {
        "id": "FA-2026-0001",
        "visitId": "VIS-2026-00001",
        "patientId": "PAT-2026-000001",
        "patientName": "Customer 1",
        "patientOpNumber": "OP-2026-00001",
        "doctorId": "staff-1792653030970",
        "doctorName": "Dr. DOCTOR TEST",
        "consultationFee": 0,
        "items": [
          {
            "id": "tp-item-0",
            "description": "Root Canal Therapy",
            "quantity": 1,
            "unitPrice": 3500,
            "total": 3500
          }
        ],
        "subtotal": 3500,
        "discountType": "amount",
        "discountValue": 0,
        "discountAmount": 0,
        "discountReason": "None",
        "authorizingDoctorId": "staff-1792653030970",
        "authorizingDoctorName": "DOCTOR TEST",
        "tax": 0,
        "finalPayable": 3500,
        "approvedAt": "2026-11-08T09:57:27.888Z",
        "status": "Approved",
        "invoiceId": "INV-2026-0001"
      }
    ],
    "payments": [
      {
        "id": "PAY-2026-0003",
        "receiptNumber": "REC-2026-0003",
        "invoiceId": "INV-2026-0002",
        "patientId": "PAT-2026-000001",
        "patientName": "Customer 1",
        "doctorName": "Dr. DOCTOR TEST",
        "amount": 1300,
        "paymentMethod": "Cash",
        "receivedBy": "TEST DESK",
        "date": "2026-11-09",
        "time": "02:02 pm",
        "notes": "Payment collected at checkout by TEST DESK",
        "status": "Successful"
      },
      {
        "id": "PAY-2026-0001",
        "receiptNumber": "REC-2026-0001",
        "invoiceId": "INV-2026-0001",
        "patientId": "PAT-2026-000001",
        "patientName": "Customer 1",
        "doctorName": "Dr. DOCTOR TEST",
        "amount": 3500,
        "paymentMethod": "Cash",
        "receivedBy": "TEST DESK",
        "date": "2026-11-08",
        "time": "04:17 pm",
        "notes": "Payment collected at checkout by TEST DESK",
        "status": "Successful"
      }
    ]
  },
  {
    "id": "PAT-2026-000002",
    "opNumber": "OP-2026-00002",
    "name": "customer 2",
    "phone": "9633746592",
    "age": 21,
    "gender": "Female",
    "dateOfBirth": "2005-01-01",
    "assignedDoctorId": "staff-1792653030970",
    "assignedDoctorName": "Dr. DOCTOR TEST",
    "firstVisitDate": "2026-11-05",
    "lastVisit": "2026-11-05",
    "totalVisits": 0,
    "currentTreatment": "Initial Consultation & Examination",
    "status": "New Patient",
    "outstandingBalance": 0,
    "dentalChart": [],
    "clinicalNotes": [],
    "treatmentPlans": [],
    "visits": []
  },
  {
    "id": "PAT-2026-000003",
    "opNumber": "OP-2026-00003",
    "name": "customer 3",
    "phone": "9633746593",
    "age": 25,
    "gender": "Female",
    "dateOfBirth": "2001-01-01",
    "assignedDoctorId": "staff-1792653030970",
    "assignedDoctorName": "Dr. DOCTOR TEST",
    "firstVisitDate": "2026-11-05",
    "lastVisit": "2026-11-05",
    "totalVisits": 0,
    "currentTreatment": "Initial Consultation & Examination",
    "status": "New Patient",
    "outstandingBalance": 0,
    "dentalChart": [],
    "clinicalNotes": [],
    "treatmentPlans": [],
    "visits": []
  }
];

export const SEED_TOKENS: QueueToken[] = [
  {
    "id": "tok-1794029717795",
    "tokenNumber": "W-001",
    "patientId": "PAT-2026-000001",
    "patientName": "Customer 1",
    "patientPhone": "9633746591",
    "visitId": "VIS-2026-00001",
    "doctorId": "staff-1792653030970",
    "doctorName": "Dr. DOCTOR TEST",
    "date": "2026-11-07",
    "status": "Completed",
    "priority": "Normal",
    "createdAt": "11:05 am",
    "estimatedWaitMinutes": 15,
    "calledAt": "11:06 am",
    "chairId": "chair-1",
    "chairName": "Dental Operatory 1 (Main Surgery)",
    "consultationStartedAt": "11:07 am",
    "completedAt": "04:17 pm"
  },
  {
    "id": "tok-1794029736556",
    "tokenNumber": "W-002",
    "patientId": "PAT-2026-000002",
    "patientName": "customer 2",
    "patientPhone": "9633746592",
    "visitId": "VIS-2026-00002",
    "doctorId": "staff-1792653030970",
    "doctorName": "Dr. DOCTOR TEST",
    "date": "2026-11-07",
    "status": "Completed",
    "priority": "Normal",
    "createdAt": "11:05 am",
    "estimatedWaitMinutes": 15,
    "calledAt": "11:10 am",
    "consultationStartedAt": "11:12 am",
    "completedAt": "11:35 am"
  },
  {
    "id": "tok-1794203767035",
    "tokenNumber": "W-003",
    "patientId": "PAT-2026-000001",
    "patientName": "Customer 1",
    "patientPhone": "9633746591",
    "visitId": "VIS-2026-00003",
    "doctorId": "staff-1792653030970",
    "doctorName": "Dr. DOCTOR TEST",
    "date": "2026-11-09",
    "status": "Completed",
    "priority": "Normal",
    "createdAt": "11:26 am",
    "estimatedWaitMinutes": 15,
    "calledAt": "11:26 am",
    "chairId": "chair-1",
    "chairName": "Dental Operatory 1 (Main Surgery)",
    "consultationStartedAt": "11:26 am",
    "completedAt": "01:24 pm"
  }
];

export const SEED_VISITS: ClinicVisit[] = [
  {
    "id": "VIS-2026-00003",
    "patientId": "PAT-2026-000001",
    "patientName": "Customer 1",
    "opNumber": "OP-2026-00001",
    "patientPhone": "9633746591",
    "doctorId": "staff-1792653030970",
    "doctorName": "Dr. DOCTOR TEST",
    "visitDate": "2026-11-09",
    "checkInTime": "11:26 am",
    "status": "Closed",
    "tokenId": "W-003",
    "priority": "Normal",
    "reasonForVisit": "Severe throbbing toothache",
    "timeline": [
      {
        "time": "11:26 am",
        "event": "Patient Checked In. Token W-003 generated by TEST DESK.",
        "actor": "TEST DESK"
      },
      {
        "time": "11:26 am",
        "event": "Token W-003 Called by DOCTOR TEST. Directed to consultation suite.",
        "actor": "DOCTOR TEST"
      },
      {
        "time": "11:26 am",
        "event": "Consultation Started with Dr. DOCTOR TEST. Examination underway.",
        "actor": "DOCTOR TEST"
      },
      {
        "time": "01:24 pm",
        "event": "Consultation Completed by DOCTOR TEST. Transferred to Reception for Checkout & Bill Settlement.",
        "actor": "DOCTOR TEST"
      },
      {
        "time": "02:02 pm",
        "event": "Encounter Closed by Receptionist TEST DESK. Patient checkout complete.",
        "actor": "TEST DESK",
        "notes": ""
      }
    ],
    "calledTime": "11:26 am",
    "chairId": "chair-1",
    "chairName": "Dental Operatory 1 (Main Surgery)",
    "consultationStartTime": "11:26 am",
    "feeApproval": {
      "id": "FA-2026-0002",
      "visitId": "VIS-2026-00003",
      "patientId": "PAT-2026-000001",
      "patientName": "Customer 1",
      "patientOpNumber": "OP-2026-00001",
      "doctorId": "staff-1792653030970",
      "doctorName": "Dr. DOCTOR TEST",
      "consultationFee": 0,
      "items": [
        {
          "id": "tp-item-0",
          "description": "Composite Resin Restoration (Filling)",
          "quantity": 1,
          "unitPrice": 1300,
          "total": 1300
        }
      ],
      "subtotal": 1300,
      "discountType": "amount",
      "discountValue": 0,
      "discountAmount": 0,
      "discountReason": "None",
      "authorizingDoctorId": "staff-1792653030970",
      "authorizingDoctorName": "DOCTOR TEST",
      "tax": 0,
      "finalPayable": 1300,
      "approvedAt": "2026-11-09T07:53:51.218Z",
      "status": "Approved",
      "invoiceId": "INV-2026-0002"
    },
    "invoiceId": "INV-2026-0002",
    "consultationEndTime": "01:24 pm",
    "completedByDoctor": "DOCTOR TEST",
    "diagnosis": "test",
    "clinicalNotes": "test 2",
    "treatmentPlan": "test 2",
    "followUpDate": "2026-12-05",
    "closedAt": "02:02 pm",
    "closedBy": "TEST DESK"
  },
  {
    "id": "VIS-2026-00002",
    "patientId": "PAT-2026-000002",
    "patientName": "customer 2",
    "opNumber": "OP-2026-00002",
    "patientPhone": "9633746592",
    "doctorId": "staff-1792653030970",
    "doctorName": "Dr. DOCTOR TEST",
    "visitDate": "2026-11-07",
    "checkInTime": "11:05 am",
    "status": "Closed",
    "tokenId": "W-002",
    "priority": "Normal",
    "reasonForVisit": "Initial Consultation & Examination",
    "closedAt": "11:35 am",
    "closedBy": "DOCTOR TEST",
    "timeline": [
      {
        "time": "11:05 am",
        "event": "Patient Checked In. Token W-002 generated by TEST DESK.",
        "actor": "TEST DESK"
      },
      {
        "time": "11:10 am",
        "event": "Token W-002 Called by DOCTOR TEST. Directed to consultation suite.",
        "actor": "DOCTOR TEST"
      },
      {
        "time": "11:35 am",
        "event": "Consultation Completed. Case closed.",
        "actor": "DOCTOR TEST"
      }
    ]
  },
  {
    "id": "VIS-2026-00001",
    "patientId": "PAT-2026-000001",
    "patientName": "Customer 1",
    "opNumber": "OP-2026-00001",
    "patientPhone": "9633746591",
    "doctorId": "staff-1792653030970",
    "doctorName": "Dr. DOCTOR TEST",
    "visitDate": "2026-11-07",
    "checkInTime": "11:05 am",
    "status": "Closed",
    "tokenId": "W-001",
    "priority": "Normal",
    "reasonForVisit": "Initial Consultation & Examination",
    "timeline": [
      {
        "time": "11:05 am",
        "event": "Patient Checked In. Token W-001 generated by TEST DESK.",
        "actor": "TEST DESK"
      },
      {
        "time": "11:06 am",
        "event": "Token W-001 Called by DOCTOR TEST. Directed to consultation suite.",
        "actor": "DOCTOR TEST"
      },
      {
        "time": "11:07 am",
        "event": "Consultation Started with Dr. DOCTOR TEST. Examination underway.",
        "actor": "DOCTOR TEST"
      },
      {
        "time": "04:17 pm",
        "event": "Consultation Completed by DOCTOR TEST. Transferred to Reception for Checkout & Bill Settlement.",
        "actor": "DOCTOR TEST"
      },
      {
        "time": "04:18 pm",
        "event": "Encounter Closed by Receptionist TEST DESK. Patient checkout complete.",
        "actor": "TEST DESK",
        "notes": ""
      }
    ],
    "calledTime": "11:06 am",
    "chairId": "chair-1",
    "chairName": "Dental Operatory 1 (Main Surgery)",
    "consultationStartTime": "11:07 am",
    "prescriptionRecord": {
      "id": "RX-2026-0002",
      "visitId": "VIS-2026-00001",
      "patientId": "PAT-2026-000001",
      "patientName": "Customer 1",
      "patientOpNumber": "OP-2026-00001",
      "patientAge": 22,
      "patientGender": "Male",
      "doctorId": "staff-1792653030970",
      "doctorName": "DOCTOR TEST",
      "doctorTitle": "BDS, MDS — Dental Specialist & Surgeon",
      "clinicName": "Shriya Multispeciality Dental Clinic",
      "clinicAddress": "402, Green Glen Layout, Outer Ring Road, Bellandur, Bengaluru",
      "clinicPhone": "+91 98888 77777",
      "date": "2026-11-08",
      "diagnosis": "Severe throbbing toothache",
      "items": [
        {
          "id": "rx-1794130154875",
          "medicine": "Amoxicillin + Clavulanate (Augmentin)",
          "dosage": "625mg",
          "route": "Oral",
          "frequency": "BD",
          "duration": "5 days",
          "instructions": "After food"
        }
      ],
      "doctorNotes": "",
      "followUpDate": "2026-11-14",
      "createdAt": "2026-11-08T09:29:59.721Z"
    },
    "prescriptions": "Amoxicillin + Clavulanate (Augmentin) 625mg (BD)",
    "feeApproval": {
      "id": "FA-2026-0001",
      "visitId": "VIS-2026-00001",
      "patientId": "PAT-2026-000001",
      "patientName": "Customer 1",
      "patientOpNumber": "OP-2026-00001",
      "doctorId": "staff-1792653030970",
      "doctorName": "Dr. DOCTOR TEST",
      "consultationFee": 0,
      "items": [
        {
          "id": "tp-item-0",
          "description": "Root Canal Therapy",
          "quantity": 1,
          "unitPrice": 3500,
          "total": 3500
        }
      ],
      "subtotal": 3500,
      "discountType": "amount",
      "discountValue": 0,
      "discountAmount": 0,
      "discountReason": "None",
      "authorizingDoctorId": "staff-1792653030970",
      "authorizingDoctorName": "DOCTOR TEST",
      "tax": 0,
      "finalPayable": 3500,
      "approvedAt": "2026-11-08T09:57:27.888Z",
      "status": "Approved",
      "invoiceId": "INV-2026-0002"
    },
    "invoiceId": "INV-2026-0002",
    "consultationEndTime": "04:17 pm",
    "completedByDoctor": "DOCTOR TEST",
    "diagnosis": "TEST",
    "clinicalNotes": "TEST",
    "treatmentPlan": "TEST",
    "followUpDate": "2026-11-29",
    "closedAt": "04:18 pm",
    "closedBy": "TEST DESK"
  }
];

export const SEED_INVOICES: Invoice[] = [
  {
    "id": "INV-2026-0002",
    "patientId": "PAT-2026-000001",
    "patientName": "Customer 1",
    "patientOpNumber": "OP-2026-00001",
    "doctorName": "Dr. DOCTOR TEST",
    "date": "2026-11-09",
    "feeApprovalId": "FA-2026-0002",
    "approvedBy": "DOCTOR TEST",
    "discountReason": "None",
    "items": [
      {
        "id": "tp-item-0",
        "description": "Composite Resin Restoration (Filling)",
        "quantity": 1,
        "unitPrice": 1300,
        "total": 1300
      }
    ],
    "subtotal": 1300,
    "discount": 0,
    "tax": 0,
    "total": 1300,
    "paid": 1300,
    "balance": 0,
    "status": "Paid",
    "payments": [
      {
        "id": "PAY-2026-0003",
        "receiptNumber": "REC-2026-0003",
        "invoiceId": "INV-2026-0002",
        "patientId": "PAT-2026-000001",
        "patientName": "Customer 1",
        "doctorName": "Dr. DOCTOR TEST",
        "amount": 1300,
        "paymentMethod": "Cash",
        "receivedBy": "TEST DESK",
        "date": "2026-11-09",
        "time": "02:02 pm",
        "notes": "Payment collected at checkout by TEST DESK",
        "status": "Successful"
      }
    ],
    "paymentMethod": "Cash"
  },
  {
    "id": "INV-2026-0001",
    "patientId": "PAT-2026-000001",
    "patientName": "Customer 1",
    "patientOpNumber": "OP-2026-00001",
    "doctorName": "Dr. DOCTOR TEST",
    "date": "2026-11-08",
    "feeApprovalId": "FA-2026-0001",
    "approvedBy": "DOCTOR TEST",
    "discountReason": "None",
    "items": [
      {
        "id": "tp-item-0",
        "description": "Root Canal Therapy",
        "quantity": 1,
        "unitPrice": 3500,
        "total": 3500
      }
    ],
    "subtotal": 3500,
    "discount": 0,
    "tax": 0,
    "total": 3500,
    "paid": 3500,
    "balance": 0,
    "status": "Paid",
    "payments": [
      {
        "id": "PAY-2026-0001",
        "receiptNumber": "REC-2026-0001",
        "invoiceId": "INV-2026-0001",
        "patientId": "PAT-2026-000001",
        "patientName": "Customer 1",
        "doctorName": "Dr. DOCTOR TEST",
        "amount": 3500,
        "paymentMethod": "Cash",
        "receivedBy": "TEST DESK",
        "date": "2026-11-08",
        "time": "04:17 pm",
        "notes": "Payment collected at checkout by TEST DESK",
        "status": "Successful"
      }
    ],
    "paymentMethod": "Cash"
  }
];

export const SEED_PAYMENTS: PaymentRecord[] = [
  {
    "id": "PAY-2026-0003",
    "receiptNumber": "REC-2026-0003",
    "invoiceId": "INV-2026-0002",
    "patientId": "PAT-2026-000001",
    "patientName": "Customer 1",
    "doctorName": "Dr. DOCTOR TEST",
    "amount": 1300,
    "paymentMethod": "Cash",
    "receivedBy": "TEST DESK",
    "date": "2026-11-09",
    "time": "02:02 pm",
    "notes": "Payment collected at checkout by TEST DESK",
    "status": "Successful"
  },
  {
    "id": "PAY-2026-0001",
    "receiptNumber": "REC-2026-0001",
    "invoiceId": "INV-2026-0001",
    "patientId": "PAT-2026-000001",
    "patientName": "Customer 1",
    "doctorName": "Dr. DOCTOR TEST",
    "amount": 3500,
    "paymentMethod": "Cash",
    "receivedBy": "TEST DESK",
    "date": "2026-11-08",
    "time": "04:17 pm",
    "notes": "Payment collected at checkout by TEST DESK",
    "status": "Successful"
  }
];

export const SEED_PRESCRIPTIONS: PrescriptionRecord[] = [
  {
    "id": "RX-2026-0002",
    "visitId": "VIS-2026-00001",
    "patientId": "PAT-2026-000001",
    "patientName": "Customer 1",
    "patientOpNumber": "OP-2026-00001",
    "patientAge": 22,
    "patientGender": "Male",
    "doctorId": "staff-1792653030970",
    "doctorName": "DOCTOR TEST",
    "doctorTitle": "BDS, MDS — Dental Specialist & Surgeon",
    "clinicName": "Shriya Multispeciality Dental Clinic",
    "clinicAddress": "402, Green Glen Layout, Outer Ring Road, Bellandur, Bengaluru",
    "clinicPhone": "+91 98888 77777",
    "date": "2026-11-08",
    "diagnosis": "Severe throbbing toothache",
    "items": [
      {
        "id": "rx-1794130154875",
        "medicine": "Amoxicillin + Clavulanate (Augmentin)",
        "dosage": "625mg",
        "route": "Oral",
        "frequency": "BD",
        "duration": "5 days",
        "instructions": "After food"
      }
    ],
    "doctorNotes": "",
    "followUpDate": "2026-11-14",
    "createdAt": "2026-11-08T09:29:59.721Z"
  }
];

export const SEED_USERS: StaffUser[] = [
  {
    "id": "usr-admin-01",
    "name": "ADMIN",
    "email": "admin@clinic.com",
    "role": "admin",
    "password": "Password@123",
    "phone": "+91 98765 33445",
    "status": "Active"
  },
  {
    "id": "staff-1792653030970",
    "name": "Dr. DOCTOR TEST",
    "email": "doctor@gmail.com",
    "role": "doctor",
    "password": "Password@123",
    "phone": "+919633746591",
    "specialization": "Orthodontics & Aligners",
    "qualification": "BDS, MDS",
    "roomNumber": "Cabin 101",
    "status": "Active"
  },
  {
    "id": "staff-1792774723829",
    "name": "TEST DESK",
    "email": "desk@gmail.com",
    "role": "receptionist",
    "password": "Password@123",
    "phone": "+919633746594",
    "roomNumber": "Cabin 102",
    "status": "Active"
  }
];

export const SEED_FEE_APPROVALS: FeeApprovalRecord[] = [
  {
    "id": "FA-2026-0002",
    "visitId": "VIS-2026-00003",
    "patientId": "PAT-2026-000001",
    "patientName": "Customer 1",
    "patientOpNumber": "OP-2026-00001",
    "doctorId": "staff-1792653030970",
    "doctorName": "Dr. DOCTOR TEST",
    "consultationFee": 0,
    "items": [
      {
        "id": "tp-item-0",
        "description": "Composite Resin Restoration (Filling)",
        "quantity": 1,
        "unitPrice": 1300,
        "total": 1300
      }
    ],
    "subtotal": 1300,
    "discountType": "amount",
    "discountValue": 0,
    "discountAmount": 0,
    "discountReason": "None",
    "authorizingDoctorId": "staff-1792653030970",
    "authorizingDoctorName": "DOCTOR TEST",
    "tax": 0,
    "finalPayable": 1300,
    "approvedAt": "2026-11-09T07:53:51.218Z",
    "status": "Approved",
    "invoiceId": "INV-2026-0002"
  },
  {
    "id": "FA-2026-0001",
    "visitId": "VIS-2026-00001",
    "patientId": "PAT-2026-000001",
    "patientName": "Customer 1",
    "patientOpNumber": "OP-2026-00001",
    "doctorId": "staff-1792653030970",
    "doctorName": "Dr. DOCTOR TEST",
    "consultationFee": 0,
    "items": [
      {
        "id": "tp-item-0",
        "description": "Root Canal Therapy",
        "quantity": 1,
        "unitPrice": 3500,
        "total": 3500
      }
    ],
    "subtotal": 3500,
    "discountType": "amount",
    "discountValue": 0,
    "discountAmount": 0,
    "discountReason": "None",
    "authorizingDoctorId": "staff-1792653030970",
    "authorizingDoctorName": "DOCTOR TEST",
    "tax": 0,
    "finalPayable": 3500,
    "approvedAt": "2026-11-08T09:57:27.888Z",
    "status": "Approved",
    "invoiceId": "INV-2026-0001"
  }
];

export const SEED_MEDICINES: MedicineRecord[] = [
  {
    "id": "med-001",
    "name": "Amoxicillin + Clavulanate (Augmentin)",
    "dosage": "625mg",
    "route": "Oral",
    "frequency": "BD",
    "duration": "5 days",
    "instructions": "After food",
    "category": "Antibiotic"
  },
  {
    "id": "med-002",
    "name": "Amoxicillin",
    "dosage": "500mg",
    "route": "Oral",
    "frequency": "TDS",
    "duration": "5 days",
    "instructions": "After food",
    "category": "Antibiotic"
  },
  {
    "id": "med-003",
    "name": "Ibuprofen + Paracetamol (Combiflam)",
    "dosage": "400mg/325mg",
    "route": "Oral",
    "frequency": "SOS",
    "duration": "3 days",
    "instructions": "After food (with antacid)",
    "category": "Analgesic"
  },
  {
    "id": "med-004",
    "name": "Ketorolac Tromethamine (Ketorol-DT)",
    "dosage": "10mg",
    "route": "Oral",
    "frequency": "SOS",
    "duration": "3 days",
    "instructions": "Disperse in warm water",
    "category": "Analgesic"
  },
  {
    "id": "med-005",
    "name": "Metronidazole (Flagyl)",
    "dosage": "400mg",
    "route": "Oral",
    "frequency": "TDS",
    "duration": "5 days",
    "instructions": "After meals",
    "category": "Antibiotic"
  },
  {
    "id": "med-006",
    "name": "Chlorhexidine Gluconate Mouthwash",
    "dosage": "10ml",
    "route": "Topical rinse",
    "frequency": "BD",
    "duration": "7 days",
    "instructions": "Swish for 60 seconds, no food for 30m",
    "category": "Antiseptic"
  },
  {
    "id": "med-007",
    "name": "Pantoprazole (Pan-40)",
    "dosage": "40mg",
    "route": "Oral",
    "frequency": "OD",
    "duration": "5 days",
    "instructions": "Before breakfast",
    "category": "Antacid"
  },
  {
    "id": "med-008",
    "name": "Triamcinolone Acetonide (Kenacort 0.1%)",
    "dosage": "Pea size",
    "route": "Topical application",
    "frequency": "TDS",
    "duration": "5 days",
    "instructions": "Apply over ulcer after meals",
    "category": "Topical"
  },
  {
    "id": "med-009",
    "name": "Paracetamol (Dolo 650)",
    "dosage": "650mg",
    "route": "Oral",
    "frequency": "SOS",
    "duration": "3 days",
    "instructions": "After food for fever or mild pain",
    "category": "Analgesic"
  },
  {
    "id": "med-010",
    "name": "Aceclofenac + Paracetamol (Zerodol-P)",
    "dosage": "100mg/325mg",
    "route": "Oral",
    "frequency": "BD",
    "duration": "3 days",
    "instructions": "After food",
    "category": "Analgesic"
  }
];

export const SEED_DOCTORS: Doctor[] = SEED_USERS
  .filter((u) => u.role === 'doctor')
  .map((u) => ({
    id: u.id,
    name: u.name,
    specialization: u.specialization || 'Orthodontics & Aligners',
    qualification: u.qualification || 'BDS, MDS',
    experience: '8+ Years',
    avatar: u.avatar || '',
    availability: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    cabinNumber: u.roomNumber || 'Cabin 101',
    rating: 4.9,
    reviewsCount: 120,
    phone: u.phone || '+91 9400320890',
    email: u.email || 'doctor@gmail.com'
  }));
