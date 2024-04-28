import openai
from openai import OpenAI
from dotenv import load_dotenv
import os
import json
import math

# load_dotenv()
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

# Helper Functions
def calculate_angle(p1, p2, p3):
    """Calculate the angle formed at p2 by points p1, p2, and p3, with divide by zero failsafe."""
    def vector(p1, p2):
        return (p2['x'] - p1['x'], p2['y'] - p1['y'])

    v1 = vector(p1, p2)
    v2 = vector(p3, p2)

    dot_product = v1[0] * v2[0] + v1[1] * v2[1]
    magnitude1 = math.sqrt(v1[0]**2 + v1[1]**2)
    magnitude2 = math.sqrt(v2[0]**2 + v2[1]**2)

    # Check if either magnitude is zero to prevent division by zero
    if magnitude1 == 0 or magnitude2 == 0:
        return 0  # Can return 0 or some other default value indicating an undefined angle

    # Calculate cosine of the angle using the dot product
    cos_angle = dot_product / (magnitude1 * magnitude2)
    # Clamp cos_angle within the valid range for acos, even if there's a slight floating point error
    cos_angle = max(-1, min(1, cos_angle))

    # Calculate the angle in radians and convert to degrees
    angle = math.acos(cos_angle)
    return math.degrees(angle)


def distance(p1, p2):
    """Calculate the Euclidean distance between two points."""
    return math.sqrt((p1['x'] - p2['x'])**2 + (p1['y'] - p2['y'])**2)

def calculate_body_rotations(frame):
    """Calculate rotational angles for shoulders and hips."""
    return {
        'shoulder_rotation': calculate_angle(frame['Left Shoulder'], frame['Right Shoulder'], {'x': frame['Nose']['x'], 'y': frame['Nose']['y'] + 10}),
        'hip_rotation': calculate_angle(frame['Left Hip'], frame['Right Hip'], {'x': frame['Nose']['x'], 'y': frame['Nose']['y'] + 10})
    }

def calculate_elbow_bend(frame):
    """Calculate elbow bend angles."""
    return {
        'right_elbow': calculate_angle(frame['Right Shoulder'], frame['Right Elbow'], frame['Right Wrist']),
        'left_elbow': calculate_angle(frame['Left Shoulder'], frame['Left Elbow'], frame['Left Wrist'])
    }

def calculate_knee_flexion(frame):
    """Calculate knee flexion angles."""
    return {
        'right_knee': calculate_angle(frame['Right Hip'], frame['Right Knee'], frame['Right Ankle']),
        'left_knee': calculate_angle(frame['Left Hip'], frame['Left Knee'], frame['Left Ankle'])
    }

def calculate_weight_shift(frames):
    """Assess the shift in weight by comparing hip positions over frames."""
    if len(frames) > 1:
        return distance(frames[0]['Right Hip'], frames[-1]['Right Hip'])
    return 0

def calculate_wrist_hinge(frame):
    """Calculate the hinge angles for the golfer's wrists."""
    return {
        'right_wrist_hinge': calculate_angle(frame['Right Elbow'], frame['Right Wrist'], {'x': frame['Right Wrist']['x'] + 10, 'y': frame['Right Wrist']['y']}),
        'left_wrist_hinge': calculate_angle(frame['Left Elbow'], frame['Left Wrist'], {'x': frame['Left Wrist']['x'] - 10, 'y': frame['Left Wrist']['y']})
    }

def calculate_balance_stability(frames):
    """Calculate metrics indicative of the golfer's balance and stability throughout the swing."""
    balance_metrics = {}
    if len(frames) > 1:
        initial_frame = frames[0]
        final_frame = frames[-1]
        balance_metrics['hip_stability'] = distance(initial_frame['Right Hip'], final_frame['Right Hip'])
        balance_metrics['ankle_stability'] = distance(initial_frame['Right Ankle'], final_frame['Right Ankle'])
    return balance_metrics

def process_keypoints_data(keypoints_data):
    """Generate a comprehensive analysis of golf swing using various metrics."""
    user_results = {}
    reference_results = {}
    for key in ['body_rotations', 'elbow_bend', 'knee_flexion', 'weight_shift', 'wrist_hinge']:
        user_results[key] = []
        reference_results[key] = []
    
    for frame in keypoints_data['user']:
        user_results['body_rotations'].append(calculate_body_rotations(frame))
        user_results['elbow_bend'].append(calculate_elbow_bend(frame))
        user_results['knee_flexion'].append(calculate_knee_flexion(frame))
        user_results['wrist_hinge'].append(calculate_wrist_hinge(frame))
    
    user_results['weight_shift'] = calculate_weight_shift(keypoints_data['user'])
    user_results['balance'] = calculate_balance_stability(keypoints_data['user'])

    for frame in keypoints_data['reference']:
        reference_results['body_rotations'].append(calculate_body_rotations(frame))
        reference_results['elbow_bend'].append(calculate_elbow_bend(frame))
        reference_results['knee_flexion'].append(calculate_knee_flexion(frame))
        reference_results['wrist_hinge'].append(calculate_wrist_hinge(frame))
    
    reference_results['weight_shift'] = calculate_weight_shift(keypoints_data['reference'])
    reference_results['balance'] = calculate_balance_stability(keypoints_data['reference'])

    return user_results, reference_results


def generate_golf_swing_feedback(user_angles, pro_angles):
    """
    Generates feedback on a golf swing by comparing user's angles with a pro's angles.

    Parameters:
    user_angles (dict): A dictionary of user's joint angles.
    pro_angles (dict): A dictionary of pro's joint angles.

    Returns:
    str: Feedback generated by GPT-3.5 Turbo.
    """
    
    user_angles = {
        'left_arm': 100,
        'right_arm': 105,
        'left_shoulder': 110,
        'right_shoulder': 120
        # Add all the other angles
    }

    # pro_angles = {
    #     'left_arm': 90,
    #     'right_arm': 95,
    #     'left_shoulder': 100,
    #     'right_shoulder': 105
    #     # Add all the other angles
    # }
    
    # Construct the prompt for GPT-3.5 Turbo
    prompt = "I am a golf coach analyzing swing angles. Compare the following user's golf swing angles with the professional standard and provide detailed suggestions for improvement:\n\n"
    
    # # Add the angle comparison to the prompt
    # for joint, user_angle in user_angles.items():
    #     pro_angle = pro_angles[joint]
    #     angle_difference = user_angle - pro_angle
    #     prompt += f"{joint.capitalize()} Angle: User = {user_angle} degrees, Pro = {pro_angle} degrees.\n"
    

    # response = client.chat.completions.create(
    #     model="gpt-3.5-turbo",
    #     messages=[
    #         {"role": "system", "content": "You are a golf coach. Your job is to give suggestions to the user golfer after"
    #             + " comparing different body angles of a user golfer and a pro golfer. "},
    #         {"role": "user", "content": prompt}, 
    #         {"role": "assistant", "content": "Suggestions: "}
    #     ],
    #     max_tokens = 400
    # )
    

    # Extract and return the suggestions from the response
    return user_angles, pro_angles

# Example joint angles from user and pro


# Generate feedback
# feedback = generate_golf_swing_feedback(user_angles_example, pro_angles_example)
# print("Feedback from AI Golf Coach:\n", feedback)
