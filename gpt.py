import openai
from openai import OpenAI
from dotenv import load_dotenv
import os
import json
import math

# load_dotenv()
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

client = OpenAI(api_key='')


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

    # Save the results to a JSON file
    
    return generate_feedback_based_on_loaded_data(user_results, reference_results)

def load_keypoints_results(filename='keypoints_analysis_results.json'):
    """
    Load the saved keypoints analysis results from a JSON file.
    
    Args:
        filename (str): The path to the JSON file containing the results.
    
    Returns:
        dict: A dictionary containing the user and reference results.
    """
    try:
        with open(filename, 'r') as file:
            data = json.load(file)
            user_results = data.get('user_results', {})
            reference_results = data.get('reference_results', {})
            return user_results, reference_results
    except FileNotFoundError:
        print("The specified file was not found.")
    except json.JSONDecodeError:
        print("Error decoding JSON from the file.")
    except Exception as e:
        print(f"An error occurred: {e}")

# Example of loading the data

def generate_feedback_based_on_loaded_data(user_results, reference_results):
    """
    Generate feedback using the loaded keypoints analysis results.
    
    Args:
        user_results (dict): The user results loaded from the file.
        reference_results (dict): The reference results loaded from the file.
    
    Returns:
        str: Generated feedback based on the results.
    """
    # Assuming you have a function to generate feedback
    user_results, reference_results = load_keypoints_results()
    feedback = generate_golf_swing_feedback(user_results, reference_results)
    return feedback


def generate_golf_swing_feedback(user_results, reference_results):
    """
    Generates targeted feedback on a golf swing by comparing user's metrics with a pro's metrics,
    highlighting the top three areas needing improvement and providing specific corrective actions,
    using the newest ChatGPT API framework.

    Parameters:
    user_results (dict): A dictionary of user's swing metrics.
    reference_results (dict): A dictionary of pro's swing metrics.

    Returns:
    str: Structured feedback generated by OpenAI's GPT-3.5 Turbo model.
    """
    differences = []
    
    # Define the importance of each metric (1-10 scale, higher means more important)
    importance = {
        'shoulder_rotation': 5,
        'hip_rotation': 6,
        'right_elbow': 4,
        'left_elbow': 4,
        'right_knee': 3,
        'left_knee': 3,
        'right_wrist_hinge': 2,
        'left_wrist_hinge': 2,
        'weight_shift': 10,  # Very high importance
        'hip_stability': 7,
        'ankle_stability': 1
    }
    
    # Define units for each metric
    units = {
        'shoulder_rotation': 'degrees',
        'hip_rotation': 'degrees',
        'right_elbow': 'degrees',
        'left_elbow': 'degrees',
        'right_knee': 'degrees',
        'left_knee': 'degrees',
        'right_wrist_hinge': 'degrees',
        'left_wrist_hinge': 'degrees',
        'weight_shift': '% of body weight',
        'hip_stability': 'stability index',
        'ankle_stability': 'stability index'
    }

    english = {
        'shoulder_rotation': 'angle',
        'hip_rotation': 'angle',
        'right_elbow': 'angle',
        'left_elbow': 'angle',
        'right_knee': 'angle',
        'left_knee': 'angle',
        'right_wrist_hinge': 'angle',
        'left_wrist_hinge': 'angle',
        'weight_shift': '',
        'hip_stability': 'stability',
        'ankle_stability': 'stability'
    }

    for category in user_results:
        if isinstance(user_results[category], list):
            for i, frame_metrics in enumerate(user_results[category]):
                for metric, user_value in frame_metrics.items():
                    ref_value = reference_results[category][i].get(metric, None)
                    if ref_value is not None:
                        diff = abs(user_value - ref_value)
                        metric_importance = importance.get(metric, 1)
                        differences.append((metric, i + 1, user_value, ref_value, diff, metric_importance * diff))
        elif isinstance(user_results[category], dict):
            for metric, user_value in user_results[category].items():
                ref_value = reference_results[category].get(metric, None)
                if ref_value is not None:
                    diff = abs(user_value - ref_value)
                    metric_importance = importance.get(metric, 1)
                    differences.append((metric, None, user_value, ref_value, diff, metric_importance * diff))
        else:
            user_value = user_results[category]
            ref_value = reference_results.get(category, None)
            if ref_value is not None:
                diff = abs(user_value - ref_value)
                metric_importance = importance.get(category, 1)
                differences.append((category, None, user_value, ref_value, diff, metric_importance * diff))

    top_differences = sorted(differences, key=lambda x: x[5], reverse=True)[:3]

    feedback_prompt = "Based on the swing analysis, here are the top three areas needing improvement:\n"
    for metric, frame, user_value, ref_value, diff, _ in top_differences:
        unit = units.get(metric, "units")  # Default unit if not specified
        frame_info = f" in frame {frame}" if frame is not None else ""
        higher_lower = "higher" if user_value > ref_value else "lower"
        advice_direction = "reduce" if user_value > ref_value else "increase"
        feedback_prompt += (
            f"**{metric.capitalize()}**{frame_info}: User current value is {user_value:.2f} {unit}, "
            f"which is {higher_lower} than the reference standard of {ref_value:.2f} {unit}. "
            f"Discrepancy: {diff:.2f} {unit}. Then provide some detailed steps on how to improve this metric. Explain to the user how to {advice_direction} the {metric.replace('_', ' ')} {english}. "
            f"and the steps to {advice_direction} it:\n"
            "- [Insert specific advice for this metric based on professional guidance]\n"
        )

    print(feedback_prompt)
    # Setup the ChatGPT API call
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are a golf coach. Your job is to analyze and provide detailed suggestions to a golfer after comparing their metrics with those of a reference golfer."},
            {"role": "user", "content": feedback_prompt}
        ],
        max_tokens=1000
    )

    # # Return the generated suggestions from the model
    return response.choices[0].message.content
    


