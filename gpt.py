import openai
from openai import OpenAI
# from dotenv import load_dotenv
import os

# load_dotenv()
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

client = OpenAI(api_key=OPENAI_API_KEY)

def generate_golf_swing_feedback(user_angles, pro_angles):
    """
    Generates feedback on a golf swing by comparing user's angles with a pro's angles.

    Parameters:
    user_angles (dict): A dictionary of user's joint angles.
    pro_angles (dict): A dictionary of pro's joint angles.

    Returns:
    str: Feedback generated by GPT-3.5 Turbo.
    """
    
    # Construct the prompt for GPT-3.5 Turbo
    prompt = "I am a golf coach analyzing swing angles. Compare the following user's golf swing angles with the professional standard and provide detailed suggestions for improvement:\n\n"
    
    # Add the angle comparison to the prompt
    for joint, user_angle in user_angles.items():
        pro_angle = pro_angles[joint]
        angle_difference = user_angle - pro_angle
        prompt += f"{joint.capitalize()} Angle: User = {user_angle} degrees, Pro = {pro_angle} degrees.\n"
    

    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are a golf coach. Your job is to give suggestions to the user golfer after"
                + " comparing different body angles of a user golfer and a pro golfer. "},
            {"role": "user", "content": prompt}, 
            {"role": "assistant", "content": "Suggestions: "}
        ],
        max_tokens = 400
    )
    

    # Extract and return the suggestions from the response
    return response.choices[0].message.content

# Example joint angles from user and pro
user_angles_example = {
    'left_arm': 100,
    'right_arm': 105,
    'left_shoulder': 110,
    'right_shoulder': 120
    # Add all the other angles
}

pro_angles_example = {
    'left_arm': 90,
    'right_arm': 95,
    'left_shoulder': 100,
    'right_shoulder': 105
    # Add all the other angles
}

# Generate feedback
# feedback = generate_golf_swing_feedback(user_angles_example, pro_angles_example)
# print("Feedback from AI Golf Coach:\n", feedback)
