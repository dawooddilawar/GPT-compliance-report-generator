from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import json
import os
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize OpenAI client
client = OpenAI()  # This will automatically use OPENAI_API_KEY from environment

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://reporter.dawood.design"],
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

Generate a JSON response with the following exact structure. Ensure all fields are filled with appropriate content:

{{
    "executive_summary": {{
        "device_overview": {{
            "device_name": "{device_name}",
            "model_number": "{model_number}",
            "manufacturer": "{manufacturer}",
            "classification": "{classification}",
            "udi_di": "Generated UDI-DI based on model number",
            "intended_purpose": "Brief version of intended use"
        }},
        "compliance_declaration": "Statement about compliance with EU MDR requirements"
    }},
    "device_description": {{
        "technical_specifications": {{
            "physical_description": "Detailed physical description",
            "materials": ["List of materials used"],
            "key_components": ["List of key components"],
            "technical_parameters": ["List of technical specifications"]
        }},
        "intended_use": {{
            "primary_function": "Primary function description",
            "target_population": "{target_population}",
            "medical_conditions": ["List of relevant medical conditions"],
            "usage_environment": "Description of usage environment"
        }}
    }},
    "regulatory_classification": {{
        "classification_details": {{
            "rule_applied": "Applicable MDR classification rule",
            "justification": "Justification for classification",
            "applicable_annexes": ["List of applicable MDR annexes"]
        }},
        "conformity_assessment": {{
            "selected_procedure": "Selected conformity assessment procedure",
            "notified_body": "Notified Body information if applicable"
        }}
    }},
    "safety_performance": {{
        "gspr_compliance": "Statement on compliance with General Safety and Performance Requirements",
        "risk_management": {{
            "process_description": "Description of risk management process",
            "analysis_method": "Risk analysis methodology",
            "benefit_risk_determination": "Benefit-risk analysis conclusion"
        }}
    }},
    "declaration": {{
        "legal_manufacturer": "{manufacturer}",
        "authorized_representative": "EU Authorized Representative details",
        "declaration_statement": "Declaration of conformity statement"
    }}
}}

Ensure all responses are professionally written and suitable for regulatory documentation. Format the response as valid JSON.
"""

@app.post("/generate-report", response_model=ComplianceReport)
async def generate_compliance_report(input_data: DeviceInput):
    try:
        # Format the prompt with the input data
        formatted_prompt = REPORT_TEMPLATE.format(
            device_name=input_data.device_name,
            manufacturer=input_data.manufacturer,
            model_number=input_data.model_number,
            classification=input_data.classification,
            intended_use=input_data.intended_use,
            target_population=input_data.target_population,
            technical_description=input_data.technical_description,
            materials=input_data.materials
        )

        # Call OpenAI API
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an EU MDR compliance expert. Provide detailed, accurate compliance reports in JSON format."},
                {"role": "user", "content": formatted_prompt}
            ],
            temperature=0.7,
        )

        # Get the response content
        response_content = response.choices[0].message.content

        # Parse the JSON response
        try:
            report_content = json.loads(response_content)
            return report_content
        except json.JSONDecodeError as e:
            print(f"JSON Decode Error: {e}")
            print(f"Response content: {response_content}")
            raise HTTPException(
                status_code=500,
                detail="Failed to parse GPT response into valid JSON"
            )

    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error generating report: {str(e)}"
        )

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)