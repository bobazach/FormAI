import cv2
import mediapipe as mp
import json

mp_pose = mp.solutions.pose
pose = mp_pose.Pose(static_image_mode=True, model_complexity=2, enable_segmentation=True, min_detection_confidence=0.5)

def detect_pose(image_path, output_path):
    image = cv2.imread(image_path)
    if image is None:
        print("Image not found.")
        return

    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    # Process the image and detect the pose.
    results = pose.process(image_rgb)

    image_bgr = cv2.cvtColor(image_rgb, cv2.COLOR_RGB2BGR)

    # Draw pose landmarks on the image.
    if results.pose_landmarks:
        mp_drawing = mp.solutions.drawing_utils
        mp_drawing.draw_landmarks(image_bgr, results.pose_landmarks, mp_pose.POSE_CONNECTIONS)

    # Save the modified image with pose landmarks to a file.
    cv2.imwrite(output_path, image_bgr)
    print(f"Output saved to {output_path}")

# first param input, second output path
detect_pose('/Users/rexzhang/Desktop/PoseEst/images/Test1.png', '/Users/rexzhang/Desktop/PoseEst/output_img/Test1.png', )
