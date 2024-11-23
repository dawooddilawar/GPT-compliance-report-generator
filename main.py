from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict
import json
import os
from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables
load_dotenv()

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your actual frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


client = OpenAI()


class ComplianceInput(BaseModel):
    device_name: str
    device_category: str
    safety_features: List[str]
    intended_use: str


class ComplianceReport(BaseModel):
    device_details: Dict
    compliance_summary: str
    safety_assessment: str
    recommendations: List[str]


REPORT_TEMPLATE = """
Please generate a compliance report for a medical device with the following structure:
1. Analyze if the device meets basic safety requirements
2. Evaluate the intended use compliance
3. Provide specific recommendations

Device Details:
- Name: {device_name}
- Category: {device_category}
- Safety Features: {safety_features}
- Intended Use: {intended_use}
"""


def validate_report(report: Dict) -> bool:
    """Basic validation to ensure report meets minimum requirements"""
    required_fields = ['compliance_summary', 'safety_assessment', 'recommendations']
    return all(field in report and len(report[field]) > 0 for field in required_fields)


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


@app.post("/generate-report", response_model=ComplianceReport)
async def generate_compliance_report(input_data: ComplianceInput):
    try:
        # Format the prompt with input data
        prompt = REPORT_TEMPLATE.format(
            device_name=input_data.device_name,
            device_category=input_data.device_category,
            safety_features=", ".join(input_data.safety_features),
            intended_use=input_data.intended_use
        )

        # Uncomment and replace with your OpenAI implementation
        response = client.chat.completions.create(
            messages=[{
                "role": "system",
                "content": prompt,
            }],
            model='gpt-4o',
            response_format={"type": "json_object"}
        )

        # Mock response for demo
        mock_report = {
            "device_details": input_data.dict(),
            "compliance_summary": f"Initial compliance assessment for {input_data.device_name}",
            "safety_assessment": (
                f"Safety features analysis for {input_data.device_category}: "
                f"Reviewed {len(input_data.safety_features)} safety features"
            ),
            "recommendations": [
                f"Verify {feature} documentation" for feature in input_data.safety_features
            ]
        }

        # Validate the generated report
        if not validate_report(mock_report):
            raise HTTPException(
                status_code=400,
                detail="Generated report failed validation checks"
            )

        return mock_report

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating report: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)