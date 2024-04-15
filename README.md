# FormAI
FormAI utilizes computer vision and machine learning to analyze your golf swing, generating suggestions for how to improve your form.

To run the code, you need to set OPENAI_API_KEY and SECRET_KEY as environment variables by following the commands below: 


   
- Run the following command in your terminal, replacing yourkey with your API key. 

       echo "export OPENAI_API_KEY='yourkey'" >> ~/.zshrc
 

- Update the shell with the new variable:

       source ~/.zshrc
 

- Confirm that you have set your environment variable using the following command. 

       echo $OPENAI_API_KEY

