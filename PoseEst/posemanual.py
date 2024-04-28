import cv2
import mediapipe as mp

def get_pose_coordinates(image_path):
    mp_pose = mp.solutions.pose
    pose = mp_pose.Pose(static_image_mode=True, model_complexity=2, enable_segmentation=True, min_detection_confidence=0.5)
    image = cv2.imread(image_path)
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    results = pose.process(image_rgb)

    keypoints = {}
    if results.pose_landmarks:
        for idx, landmark in enumerate(results.pose_landmarks.landmark):
            # Save normalized coordinates
            keypoints[mp_pose.PoseLandmark(idx).name] = (landmark.x, landmark.y)

    return keypoints, image  # Return keypoints and the original image

keypoints, original_image = get_pose_coordinates('/Users/rexzhang/Desktop/PoseEst/images/Test1.png')

def draw_keypoints_on_image(image, keypoints):
    for keypoint, (x, y) in keypoints.items():
        # Convert normalized coordinates to absolute values
        x_abs = int(x * image.shape[1])
        y_abs = int(y * image.shape[0])
        
        cv2.circle(image, (x_abs, y_abs), 5, (0, 255, 0), -1)  # Green dot

    cv2.imwrite('output_with_dots.jpg', image)
    print("Image with keypoints saved as 'output_with_dots.jpg'.")

draw_keypoints_on_image(original_image, keypoints)

