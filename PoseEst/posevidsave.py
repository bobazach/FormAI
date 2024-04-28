import cv2
import mediapipe as mp

mp_pose = mp.solutions.pose
pose = mp_pose.Pose(static_image_mode=False, model_complexity=2, enable_segmentation=False, min_detection_confidence=0.5)


# input path
cap = cv2.VideoCapture('/Users/rexzhang/Desktop/PoseEst/videos/test3.mp4')
if not cap.isOpened():
    print("Error opening video stream or file")
    exit()

# output path
output_path = '/Users/rexzhang/Desktop/PoseEst/output_vids/test3.mp4' 
fourcc = cv2.VideoWriter_fourcc(*'mp4v') 
out = cv2.VideoWriter(output_path, fourcc, cap.get(cv2.CAP_PROP_FPS), (int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)), int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))))

while cap.isOpened():
    success, frame = cap.read()
    if not success:
        break

    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    # store restuls
    results = pose.process(frame_rgb)

    frame_bgr = cv2.cvtColor(frame_rgb, cv2.COLOR_RGB2BGR)

    # draw pose landmarks on the frame.
    if results.pose_landmarks:
        mp_drawing = mp.solutions.drawing_utils
        mp_drawing.draw_landmarks(frame_bgr, results.pose_landmarks, mp_pose.POSE_CONNECTIONS)

    out.write(frame_bgr)  # Write the frame into the file specified in 'output_path'

cap.release()
out.release()  
cv2.destroyAllWindows()
