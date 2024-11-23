from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
from openai import OpenAI

client = OpenAI()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class DeviceInput(BaseModel):
    device_name: str
    manufacturer: str
    model_number: str
    classification: str
    intended_use: str
    target_population: str
    technical_description: str
    materials: str

class ComplianceReport(BaseModel):
    executive_summary: Dict
    device_description: Dict
    regulatory_classification: Dict
    safety_performance: Dict
    declaration: Dict

REPORT_TEMPLATE = """
You are an expert in medical device compliance. Generate a detailed EU MDR compliance report in JSON format for the following device:

Device Details:
- Name: {device_name}
- Manufacturer: {manufacturer}
- Model Number: {model_number}
- Classification: {classification}
- Intended Use: {intended_use}
- Target Population: {target_population}
- Technical Description: {technical_description}
- Materials: {materials}

Generate a JSON response with the following exact structure:

{
    "executive_summary": {
        "device_overview": {
            "device_name": str,
            "model_number": str,
            "manufacturer": str,
            "classification": str,
            "udi_di": str,
            "intended_purpose": str
        },
        "compliance_declaration": str
    },
    "device_description": {
        "technical_specifications": {
            "physical_description": str,
            "materials": list[str],
            "key_components": list[str],
            "technical_parameters": list[str]
        },
        "intended_use": {
            "primary_function": str,
            "target_population": str,
            "medical_conditions": list[str],
            "usage_environment": str
        }
    },
    "regulatory_classification": {
        "classification_details": {
            "rule_applied": str,
            "justification": str,
            "applicable_annexes": list[str]
        },
        "conformity_assessment": {
            "selected_procedure": str,
            "notified_body": str
        }
    },
    "safety_performance": {
        "gspr_compliance": str,
        "risk_management": {
            "process_description": str,
            "analysis_method": str,
            "benefit_risk_determination": str
        }
    },
    "declaration": {
        "legal_manufacturer": str,
        "authorized_representative": str,
        "declaration_statement": str
    }
}

Ensure all responses are professionally written and suitable for regulatory documentation.
"""

@app.post("/generate-report", response_model=ComplianceReport)
async def generate_compliance_report(input_data: DeviceInput):
    try:
        prompt = REPORT_TEMPLATE.format(
            device_name=input_data.device_name,
            manufacturer=input_data.manufacturer,
            model_number=input_data.model_number,
            classification=input_data.classification,
            intended_use=input_data.intended_use,
            target_population=input_data.target_population,
            technical_description=input_data.technical_description,
            materials=input_data.materials
        )

        response = client.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an EU MDR compliance expert. Provide detailed, accurate compliance reports in JSON format."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
        )

        # Parse the JSON response
        try:
            report_content = json.loads(response.choices[0].message.content)
            return report_content
        except json.JSONDecodeError:
            raise HTTPException(
                status_code=500,
                detail="Failed to parse GPT response into valid JSON"
            )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating report: {str(e)}"
        )

@app.get("/health")
async def health_check():
    return {"status": "healthy"}