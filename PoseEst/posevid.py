import cv2
import mediapipe as mp

mp_pose = mp.solutions.pose
pose = mp_pose.Pose(static_image_mode=False, model_complexity=2, smooth_landmarks=True, enable_segmentation=False, min_detection_confidence=0.5)

# path
cap = cv2.VideoCapture('/Users/rexzhang/Desktop/PoseEst/videos/test1.mp4')

if not cap.isOpened():
    print("Error opening video stream or file")
    exit()

# video frame by frame
while cap.isOpened():
    success, image = cap.read()
    if not success:
        print("Ignoring empty camera frame.")
        break

    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    results = pose.process(image_rgb)

    # draw pose landmarks on the frame.
    if results.pose_landmarks:
        mp_drawing = mp.solutions.drawing_utils
        mp_drawing.draw_landmarks(image, results.pose_landmarks, mp_pose.POSE_CONNECTIONS)

    # show
    cv2.imshow('Pose Estimation', image)

    # q to exit
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
