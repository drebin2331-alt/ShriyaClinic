export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-actor-id, x-actor-name, x-actor-role');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const data = {
  "patients": [
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
  ],
  "appointments": [],
  "tokens": [
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
      "status": "Waiting",
      "priority": "Normal",
      "createdAt": "11:05 am",
      "estimatedWaitMinutes": 15
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
  ],
  "visits": [
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
      "status": "Waiting",
      "tokenId": "W-002",
      "priority": "Normal",
      "reasonForVisit": "Initial Consultation & Examination",
      "timeline": [
        {
          "time": "11:05 am",
          "event": "Patient Checked In. Token W-002 generated by TEST DESK.",
          "actor": "TEST DESK"
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
      ],
      "paymentMethod": "Cash"
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
  "enquiries": [],
  "auditEvents": [
    {
      "actorId": "staff-1792774723829",
      "actorName": "TEST DESK",
      "actorRole": "receptionist",
      "action": "VISIT_CLOSED",
      "entityType": "Visit",
      "entityId": "VIS-2026-00003",
      "details": "Receptionist TEST DESK completed checkout and closed today's visit for Customer 1.",
      "id": "aud-1794213177862-30wry",
      "timestamp": "2026-11-09T08:32:57.862Z"
    },
    {
      "actorId": "staff-1792774723829",
      "actorName": "TEST DESK",
      "actorRole": "receptionist",
      "action": "PAYMENT_RECORDED",
      "entityType": "Payment",
      "entityId": "PAY-2026-0003",
      "details": "Collected ₹1300 (Cash) against Invoice INV-2026-0002. Issued Receipt REC-2026-0003. Remaining balance: ₹0.",
      "metadata": {
        "receiptNumber": "REC-2026-0003",
        "amount": 1300,
        "paymentMethod": "Cash",
        "remainingBalance": 0
      },
      "id": "aud-1794213173676-9hng1",
      "timestamp": "2026-11-09T08:32:53.676Z"
    },
    {
      "actorId": "staff-1792653030970",
      "actorName": "DOCTOR TEST",
      "actorRole": "doctor",
      "action": "CONSULTATION_COMPLETED",
      "entityType": "Visit",
      "entityId": "VIS-2026-00003",
      "details": "Doctor DOCTOR TEST completed consultation for Customer 1. Patient handed off to reception for checkout.",
      "metadata": {
        "diagnosis": "test",
        "followUpDate": "2026-12-05"
      },
      "id": "aud-1794210887150-bs162",
      "timestamp": "2026-11-09T07:54:47.150Z"
    },
    {
      "actorId": "staff-1792653030970",
      "actorName": "DOCTOR TEST",
      "actorRole": "doctor",
      "action": "PATIENT_UPDATED",
      "entityType": "Patient",
      "entityId": "PAT-2026-000001",
      "details": "Updated details for Customer 1 (OP-2026-00001).",
      "id": "aud-1794210863616-iy0er",
      "timestamp": "2026-11-09T07:54:23.616Z"
    },
    {
      "actorId": "staff-1792653030970",
      "actorName": "DOCTOR TEST",
      "actorRole": "doctor",
      "action": "FEE_APPROVED",
      "entityType": "FeeApproval",
      "entityId": "FA-2026-0002",
      "details": "Doctor DOCTOR TEST approved fee for Customer 1. Gross: ₹1300, Discount: ₹0 (None), Final: ₹1300.",
      "metadata": {
        "subtotal": 1300,
        "discountAmount": 0,
        "finalPayable": 1300,
        "invoiceId": "INV-2026-0001"
      },
      "id": "aud-1794210831232-wjltp",
      "timestamp": "2026-11-09T07:53:51.232Z"
    },
    {
      "actorId": "staff-1792653030970",
      "actorName": "DOCTOR TEST",
      "actorRole": "doctor",
      "action": "PATIENT_UPDATED",
      "entityType": "Patient",
      "entityId": "PAT-2026-000001",
      "details": "Updated details for Customer 1 (OP-2026-00001).",
      "id": "aud-1794210807889-5vak4",
      "timestamp": "2026-11-09T07:53:27.889Z"
    },
    {
      "actorId": "staff-1792653030970",
      "actorName": "DOCTOR TEST",
      "actorRole": "doctor",
      "action": "PATIENT_UPDATED",
      "entityType": "Patient",
      "entityId": "PAT-2026-000001",
      "details": "Updated details for Customer 1 (OP-2026-00001).",
      "id": "aud-1794210769203-foczk",
      "timestamp": "2026-11-09T07:52:49.203Z"
    },
    {
      "actorId": "staff-1792653030970",
      "actorName": "DOCTOR TEST",
      "actorRole": "doctor",
      "action": "PATIENT_UPDATED",
      "entityType": "Patient",
      "entityId": "PAT-2026-000001",
      "details": "Updated details for Customer 1 (OP-2026-00001).",
      "id": "aud-1794210768944-1o82q",
      "timestamp": "2026-11-09T07:52:48.944Z"
    },
    {
      "actorId": "staff-1792653030970",
      "actorName": "DOCTOR TEST",
      "actorRole": "doctor",
      "action": "PATIENT_UPDATED",
      "entityType": "Patient",
      "entityId": "PAT-2026-000001",
      "details": "Updated details for Customer 1 (OP-2026-00001).",
      "id": "aud-1794210723818-9plp9",
      "timestamp": "2026-11-09T07:52:03.818Z"
    },
    {
      "actorId": "staff-1792653030970",
      "actorName": "DOCTOR TEST",
      "actorRole": "doctor",
      "action": "PATIENT_UPDATED",
      "entityType": "Patient",
      "entityId": "PAT-2026-000001",
      "details": "Updated details for Customer 1 (OP-2026-00001).",
      "id": "aud-1794210717544-rx9n0",
      "timestamp": "2026-11-09T07:51:57.544Z"
    },
    {
      "actorId": "staff-1792653030970",
      "actorName": "DOCTOR TEST",
      "actorRole": "doctor",
      "action": "PATIENT_UPDATED",
      "entityType": "Patient",
      "entityId": "PAT-2026-000001",
      "details": "Updated details for Customer 1 (OP-2026-00001).",
      "id": "aud-1794210717531-oigv6",
      "timestamp": "2026-11-09T07:51:57.531Z"
    },
    {
      "actorId": "staff-1792653030970",
      "actorName": "DOCTOR TEST",
      "actorRole": "doctor",
      "action": "CONSULTATION_STARTED",
      "entityType": "Visit",
      "entityId": "VIS-2026-00003",
      "details": "Doctor started consultation for Customer 1 (Token W-003).",
      "id": "aud-1794203803516-il29b",
      "timestamp": "2026-11-09T05:56:43.516Z"
    },
    {
      "actorId": "staff-1792653030970",
      "actorName": "DOCTOR TEST",
      "actorRole": "doctor",
      "action": "TOKEN_CALLED",
      "entityType": "Token",
      "entityId": "W-003",
      "details": "Called Token W-003 (Customer 1) for consultation.",
      "id": "aud-1794203800722-ioc3m",
      "timestamp": "2026-11-09T05:56:40.722Z"
    },
    {
      "actorId": "staff-1792774723829",
      "actorName": "TEST DESK",
      "actorRole": "receptionist",
      "action": "PATIENT_CHECKED_IN",
      "entityType": "Visit",
      "entityId": "VIS-2026-00003",
      "details": "Checked in Customer 1 (OP-2026-00001). Generated Token W-003.",
      "metadata": {
        "tokenNumber": "W-003",
        "visitId": "VIS-2026-00003",
        "priority": "Normal"
      },
      "id": "aud-1794203767038-l4pxo",
      "timestamp": "2026-11-09T05:56:07.038Z"
    },
    {
      "actorId": "staff-1792774723829",
      "actorName": "TEST DESK",
      "actorRole": "receptionist",
      "action": "VISIT_CLOSED",
      "entityType": "Visit",
      "entityId": "VIS-2026-00001",
      "details": "Receptionist TEST DESK completed checkout and closed today's visit for Customer 1.",
      "id": "aud-1794134894998-y1rqy",
      "timestamp": "2026-11-08T10:48:14.998Z"
    },
    {
      "actorId": "staff-1792774723829",
      "actorName": "TEST DESK",
      "actorRole": "receptionist",
      "action": "PAYMENT_RECORDED",
      "entityType": "Payment",
      "entityId": "PAY-2026-0001",
      "details": "Collected ₹3500 (Cash) against Invoice INV-2026-0001. Issued Receipt REC-2026-0001. Remaining balance: ₹0.",
      "metadata": {
        "receiptNumber": "REC-2026-0001",
        "amount": 3500,
        "paymentMethod": "Cash",
        "remainingBalance": 0
      },
      "id": "aud-1794134877071-fwdve",
      "timestamp": "2026-11-08T10:47:57.071Z"
    },
    {
      "actorId": "staff-1792653030970",
      "actorName": "DOCTOR TEST",
      "actorRole": "doctor",
      "action": "CONSULTATION_COMPLETED",
      "entityType": "Visit",
      "entityId": "VIS-2026-00001",
      "details": "Doctor DOCTOR TEST completed consultation for Customer 1. Patient handed off to reception for checkout.",
      "metadata": {
        "diagnosis": "TEST",
        "followUpDate": "2026-11-29"
      },
      "id": "aud-1794134835071-icvw1",
      "timestamp": "2026-11-08T10:47:15.071Z"
    },
    {
      "actorId": "staff-1792653030970",
      "actorName": "DOCTOR TEST",
      "actorRole": "doctor",
      "action": "PATIENT_UPDATED",
      "entityType": "Patient",
      "entityId": "PAT-2026-000001",
      "details": "Updated details for Customer 1 (OP-2026-00001).",
      "id": "aud-1794134807055-9pd9g",
      "timestamp": "2026-11-08T10:46:47.055Z"
    },
    {
      "actorId": "staff-1792653030970",
      "actorName": "DOCTOR TEST",
      "actorRole": "doctor",
      "action": "FEE_APPROVED",
      "entityType": "FeeApproval",
      "entityId": "FA-2026-0001",
      "details": "Doctor DOCTOR TEST approved fee for Customer 1. Gross: ₹3500, Discount: ₹0 (None), Final: ₹3500.",
      "metadata": {
        "subtotal": 3500,
        "discountAmount": 0,
        "finalPayable": 3500,
        "invoiceId": "INV-2026-0001"
      },
      "id": "aud-1794131847896-jhfn5",
      "timestamp": "2026-11-08T09:57:27.896Z"
    },
    {
      "actorId": "staff-1792653030970",
      "actorName": "DOCTOR TEST",
      "actorRole": "doctor",
      "action": "PRESCRIPTION_DELETED",
      "entityType": "Prescription",
      "entityId": "RX-2026-0001",
      "details": "Doctor DOCTOR TEST deleted prescription RX-2026-0001 for Customer 1.",
      "metadata": {
        "rxId": "RX-2026-0001"
      },
      "id": "aud-1794131743296-ywvmr",
      "timestamp": "2026-11-08T09:55:43.296Z"
    },
    {
      "actorId": "staff-1792653030970",
      "actorName": "DOCTOR TEST",
      "actorRole": "doctor",
      "action": "PRESCRIPTION_CREATED",
      "entityType": "Prescription",
      "entityId": "RX-2026-0002",
      "details": "Doctor DOCTOR TEST issued prescription RX-2026-0002 for Customer 1 (1 medicines).",
      "metadata": {
        "rxId": "RX-2026-0002",
        "medicinesCount": 1
      },
      "id": "aud-1794130199729-civ52",
      "timestamp": "2026-11-08T09:29:59.729Z"
    },
    {
      "actorId": "staff-1792653030970",
      "actorName": "DOCTOR TEST",
      "actorRole": "doctor",
      "action": "PATIENT_UPDATED",
      "entityType": "Patient",
      "entityId": "PAT-2026-000001",
      "details": "Updated details for Customer 1 (OP-2026-00001).",
      "id": "aud-1794126643478-22m3a",
      "timestamp": "2026-11-08T08:30:43.478Z"
    },
    {
      "actorId": "staff-1792653030970",
      "actorName": "DOCTOR TEST",
      "actorRole": "doctor",
      "action": "PRESCRIPTION_CREATED",
      "entityType": "Prescription",
      "entityId": "RX-2026-0001",
      "details": "Doctor DOCTOR TEST issued prescription RX-2026-0001 for Customer 1 (1 medicines).",
      "metadata": {
        "rxId": "RX-2026-0001",
        "medicinesCount": 1
      },
      "id": "aud-1794126531186-b7ql4",
      "timestamp": "2026-11-08T08:28:51.186Z"
    },
    {
      "actorId": "staff-1792653030970",
      "actorName": "DOCTOR TEST",
      "actorRole": "doctor",
      "action": "PATIENT_UPDATED",
      "entityType": "Patient",
      "entityId": "PAT-2026-000001",
      "details": "Updated details for Customer 1 (OP-2026-00001).",
      "id": "aud-1794126501395-bltdx",
      "timestamp": "2026-11-08T08:28:21.395Z"
    },
    {
      "actorId": "staff-1792653030970",
      "actorName": "DOCTOR TEST",
      "actorRole": "doctor",
      "action": "PATIENT_UPDATED",
      "entityType": "Patient",
      "entityId": "PAT-2026-000001",
      "details": "Updated details for Customer 1 (OP-2026-00001).",
      "id": "aud-1794126501385-tn9pe",
      "timestamp": "2026-11-08T08:28:21.385Z"
    },
    {
      "actorId": "staff-1792653030970",
      "actorName": "DOCTOR TEST",
      "actorRole": "doctor",
      "action": "PATIENT_UPDATED",
      "entityType": "Patient",
      "entityId": "PAT-2026-000001",
      "details": "Updated details for Customer 1 (OP-2026-00001).",
      "id": "aud-1794126501379-h6u8u",
      "timestamp": "2026-11-08T08:28:21.379Z"
    },
    {
      "actorId": "staff-1792653030970",
      "actorName": "DOCTOR TEST",
      "actorRole": "doctor",
      "action": "PATIENT_UPDATED",
      "entityType": "Patient",
      "entityId": "PAT-2026-000001",
      "details": "Updated details for Customer 1 (OP-2026-00001).",
      "id": "aud-1794126395666-0qzvv",
      "timestamp": "2026-11-08T08:26:35.666Z"
    },
    {
      "actorId": "staff-1792653030970",
      "actorName": "DOCTOR TEST",
      "actorRole": "doctor",
      "action": "PATIENT_UPDATED",
      "entityType": "Patient",
      "entityId": "PAT-2026-000001",
      "details": "Updated details for Customer 1 (OP-2026-00001).",
      "id": "aud-1794126389185-5xoyp",
      "timestamp": "2026-11-08T08:26:29.185Z"
    },
    {
      "actorId": "staff-1792653030970",
      "actorName": "DOCTOR TEST",
      "actorRole": "doctor",
      "action": "PATIENT_UPDATED",
      "entityType": "Patient",
      "entityId": "PAT-2026-000001",
      "details": "Updated details for Customer 1 (OP-2026-00001).",
      "id": "aud-1794126367910-58h8v",
      "timestamp": "2026-11-08T08:26:07.910Z"
    },
    {
      "actorId": "staff-1792653030970",
      "actorName": "DOCTOR TEST",
      "actorRole": "doctor",
      "action": "PATIENT_UPDATED",
      "entityType": "Patient",
      "entityId": "PAT-2026-000001",
      "details": "Updated details for Customer 1 (OP-2026-00001).",
      "id": "aud-1794124489719-qnrbc",
      "timestamp": "2026-11-08T07:54:49.719Z"
    },
    {
      "actorId": "staff-1792653030970",
      "actorName": "DOCTOR TEST",
      "actorRole": "doctor",
      "action": "CONSULTATION_STARTED",
      "entityType": "Visit",
      "entityId": "VIS-2026-00001",
      "details": "Doctor started consultation for Customer 1 (Token W-001).",
      "id": "aud-1794029841150-4tkaf",
      "timestamp": "2026-11-07T05:37:21.150Z"
    },
    {
      "actorId": "staff-1792653030970",
      "actorName": "DOCTOR TEST",
      "actorRole": "doctor",
      "action": "TOKEN_CALLED",
      "entityType": "Token",
      "entityId": "W-001",
      "details": "Called Token W-001 (Customer 1) for consultation.",
      "id": "aud-1794029795622-nqjb0",
      "timestamp": "2026-11-07T05:36:35.622Z"
    },
    {
      "actorId": "staff-1792774723829",
      "actorName": "TEST DESK",
      "actorRole": "receptionist",
      "action": "PATIENT_CHECKED_IN",
      "entityType": "Visit",
      "entityId": "VIS-2026-00002",
      "details": "Checked in customer 2 (OP-2026-00002). Generated Token W-002.",
      "metadata": {
        "tokenNumber": "W-002",
        "visitId": "VIS-2026-00002",
        "priority": "Normal"
      },
      "id": "aud-1794029736558-68tje",
      "timestamp": "2026-11-07T05:35:36.558Z"
    },
    {
      "actorId": "staff-1792774723829",
      "actorName": "TEST DESK",
      "actorRole": "receptionist",
      "action": "PATIENT_CHECKED_IN",
      "entityType": "Visit",
      "entityId": "VIS-2026-00001",
      "details": "Checked in Customer 1 (OP-2026-00001). Generated Token W-001.",
      "metadata": {
        "tokenNumber": "W-001",
        "visitId": "VIS-2026-00001",
        "priority": "Normal"
      },
      "id": "aud-1794029717796-0r28o",
      "timestamp": "2026-11-07T05:35:17.796Z"
    },
    {
      "actorId": "staff-1792774723829",
      "actorName": "TEST DESK",
      "actorRole": "receptionist",
      "action": "PATIENT_REGISTERED",
      "entityType": "Patient",
      "entityId": "PAT-2026-000003",
      "details": "Registered new patient customer 3 with OP Number OP-2026-00003.",
      "metadata": {
        "opNumber": "OP-2026-00003",
        "phone": "9633746593",
        "registeredBy": "TEST DESK"
      },
      "id": "aud-1793883450737-388o0",
      "timestamp": "2026-11-05T12:57:30.737Z"
    },
    {
      "actorId": "staff-1792774723829",
      "actorName": "TEST DESK",
      "actorRole": "receptionist",
      "action": "PATIENT_REGISTERED",
      "entityType": "Patient",
      "entityId": "PAT-2026-000002",
      "details": "Registered new patient customer 3 with OP Number OP-2026-00002.",
      "metadata": {
        "opNumber": "OP-2026-00002",
        "phone": "9633746593",
        "registeredBy": "TEST DESK"
      },
      "id": "aud-1793883449089-xiq4r",
      "timestamp": "2026-11-05T12:57:29.089Z"
    },
    {
      "actorId": "staff-1792774723829",
      "actorName": "TEST DESK",
      "actorRole": "receptionist",
      "action": "PATIENT_REGISTERED",
      "entityType": "Patient",
      "entityId": "PAT-2026-000001",
      "details": "Registered new patient customer 2 with OP Number OP-2026-00001.",
      "metadata": {
        "opNumber": "OP-2026-00001",
        "phone": "9633746592",
        "registeredBy": "TEST DESK"
      },
      "id": "aud-1793883242945-hi4nb",
      "timestamp": "2026-11-05T12:54:02.945Z"
    }
  ],
  "users": [
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
  ],
  "counters": {
    "opNumber": 3,
    "tokenNormal": 0,
    "tokenWalkIn": 3,
    "invoiceNumber": 2,
    "receiptNumber": 3,
    "visitNumber": 3,
    "prescriptionNumber": 2,
    "feeApprovalNumber": 2
  },
  "feeApprovals": [
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
  ],
  "medicines": [
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
  ]
};
  return res.status(200).json(data);
}
