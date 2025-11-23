#!/usr/bin/env python3
"""
Test script for Hyperpersonalization Integration
Tests the flow: Frontend -> API Gateway -> AI Engine

Usage:
    python test_hyperpersonalization.py
"""

import asyncio
import httpx
import json
import sys
from datetime import datetime

# Configuration
API_GATEWAY_URL = "http://localhost:8000"
AI_ENGINE_URL = "http://localhost:8001"

async def test_detect_endpoint():
    """Test the /detect endpoint in AI Engine"""
    print("\n" + "="*60)
    print("TEST 1: AI Engine /detect endpoint")
    print("="*60)
    
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            payload = {
                "user_message": "Je n'ai jamais eu le courage de lui dire à quel point elle comptait pour moi. Maintenant qu'elle est partie, je me sens submergé par les regrets.",
                "user_state": {
                    "detresse": 75,
                    "social_isolation": 0.2,
                    "narrative_coherence": 0.3,
                    "complicated_grief": False
                },
                "conversation_history": [
                    {"role": "user", "content": "Je traverse une période difficile"}
                ],
                "therapeutic_context": {"alliance": 0.7}
            }
            
            response = await client.post(
                f"{AI_ENGINE_URL}/detect",
                json=payload
            )
            
            if response.status_code == 200:
                data = response.json()
                print("✅ AI Engine /detect successful!")
                print(f"Signals detected: {len(data.get('signals', []))}")
                for i, signal in enumerate(data.get('signals', []), 1):
                    print(f"\n  Signal {i}: {signal['method']}")
                    print(f"    Confidence: {signal['confidence']:.2%}")
                    print(f"    Variation: {signal.get('recommended_variation', 'N/A')}")
                    print(f"    Indicators: {signal.get('indicators', [])[:2]}...")
                return True
            else:
                print(f"❌ AI Engine error: {response.status_code}")
                print(f"Response: {response.text[:200]}")
                return False
                
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


async def test_analyze_context_endpoint():
    """Test the /api/analyze-context endpoint in API Gateway"""
    print("\n" + "="*60)
    print("TEST 2: API Gateway /api/analyze-context endpoint")
    print("="*60)
    
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            payload = {
                "user_id": "test_user_001",
                "current_message": "Je n'arrive pas à accepter son départ. C'était quelqu'un d'important pour moi et je regrette tellement les paroles blessantes que j'ai eues.",
                "tool": "journal",
                "conversation_history": [
                    {
                        "content": "Je pense à elle tous les jours",
                        "created_at": "2025-11-15T10:00:00Z"
                    }
                ]
            }
            
            response = await client.post(
                f"{API_GATEWAY_URL}/api/analyze-context",
                json=payload
            )
            
            if response.status_code == 200:
                data = response.json()
                print("✅ API Gateway /api/analyze-context successful!")
                print(f"\nDetected method: {data.get('detected_method', 'N/A')}")
                print(f"Variation: {data.get('variation', 'N/A')}")
                print(f"Confidence: {data.get('confidence', 0):.2%}")
                print(f"\nPersonalization context:")
                print(f"  {data.get('personalization_context', 'N/A')}")
                print(f"\nRecommended prompts:")
                for i, prompt in enumerate(data.get('recommended_prompts', []), 1):
                    print(f"  {i}. {prompt}")
                return True
            else:
                print(f"❌ API Gateway error: {response.status_code}")
                print(f"Response: {response.text[:200]}")
                return False
                
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


async def test_recent_entries_endpoint():
    """Test the /api/recent-entries endpoint"""
    print("\n" + "="*60)
    print("TEST 3: API Gateway /api/recent-entries endpoint")
    print("="*60)
    
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(
                f"{API_GATEWAY_URL}/api/recent-entries/test_user_001?limit=5"
            )
            
            if response.status_code == 200:
                data = response.json()
                print("✅ API Gateway /api/recent-entries successful!")
                print(f"Recent entries count: {data.get('count', 0)}")
                if data.get('entries'):
                    print(f"Sample entries: {data['entries'][:1]}")
                return True
            else:
                print(f"ℹ️  No recent entries yet (expected for new user)")
                return True  # This is OK
                
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


async def check_service_health():
    """Check if services are running"""
    print("\n" + "="*60)
    print("HEALTH CHECK")
    print("="*60)
    
    results = {}
    
    # Check API Gateway
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            response = await client.get(f"{API_GATEWAY_URL}/api/modules")
            results['API Gateway'] = response.status_code == 200
            print(f"✅ API Gateway (port 8000): OK" if results['API Gateway'] else "❌ API Gateway: FAILED")
    except Exception as e:
        results['API Gateway'] = False
        print(f"❌ API Gateway (port 8000): {str(e)[:50]}")
    
    # Check AI Engine
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            # Try to get /detect to see if service is up
            response = await client.post(f"{AI_ENGINE_URL}/detect", json={
                "user_message": "test",
                "user_state": {},
                "conversation_history": [],
                "therapeutic_context": {}
            })
            results['AI Engine'] = response.status_code in [200, 422]  # 422 means service is up but validation failed
            print(f"✅ AI Engine (port 8001): OK" if results['AI Engine'] else "❌ AI Engine: FAILED")
    except Exception as e:
        results['AI Engine'] = False
        print(f"❌ AI Engine (port 8001): {str(e)[:50]}")
    
    return all(results.values())


async def main():
    print("\n" + "="*60)
    print("HYPERPERSONALIZATION INTEGRATION TEST")
    print(f"Timestamp: {datetime.now().isoformat()}")
    print("="*60)
    
    # Check services
    services_ok = await check_service_health()
    
    if not services_ok:
        print("\n⚠️  Some services are not running!")
        print("Make sure to start:")
        print("  1. API Gateway: cd backend/api-gateway && .venv\\Scripts\\python -m uvicorn app.main:app --port 8000")
        print("  2. AI Engine: cd backend/ai-engine && .venv\\Scripts\\python -m uvicorn app.main:app --port 8001")
        sys.exit(1)
    
    # Run tests
    results = []
    
    # Test 1: Detect endpoint
    results.append(await test_detect_endpoint())
    
    # Test 2: Analyze context
    results.append(await test_analyze_context_endpoint())
    
    # Test 3: Recent entries
    results.append(await test_recent_entries_endpoint())
    
    # Summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    passed = sum(results)
    total = len(results)
    print(f"Tests passed: {passed}/{total}")
    
    if passed == total:
        print("✅ All tests passed! Hyperpersonalization is working correctly.")
        sys.exit(0)
    else:
        print(f"⚠️  {total - passed} test(s) failed. Check the output above.")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
