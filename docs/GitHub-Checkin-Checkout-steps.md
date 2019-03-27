# Steps to check/checkout code using GitHub #

1. Open the CFF project using Visual Studio Code
![image](https://user-images.githubusercontent.com/29865785/55114563-a55c3980-50b8-11e9-99ba-b5e86d7eeaff.png)

1. Select the .tsx (type script fie for reactjs) file you want to make changes to:
![image](https://user-images.githubusercontent.com/29865785/55114578-b2792880-50b8-11e9-81d9-22d839304437.png)
1. Make sure you are in the “Master” branch and click on the “Sync” icon to sync from Github Master to local Master
![image](https://user-images.githubusercontent.com/29865785/55114605-c3c23500-50b8-11e9-8d03-ce3f70699f4b.png)
1. Create a new branch for the functionality you are about to code (for example "NewButtonAdd") and name the branch same as the functionality
![image](https://user-images.githubusercontent.com/29865785/55114664-f3713d00-50b8-11e9-96a6-62f9157589de.png)
1. Make sure you are in the new branch that you just created before making the code changes
![image](https://user-images.githubusercontent.com/29865785/55114722-17348300-50b9-11e9-990f-037c88fdb893.png)
1. Make the code changes and save the file (ctrl-s) and the pending changes shows up like this:. Click on the (tick mark) Commit changes icon. This saves the changes to the local branch
![image](https://user-images.githubusercontent.com/29865785/55114826-5f53a580-50b9-11e9-87f4-f42a77518895.png)
1. Click on the "Publish Changes" icon at the bottom. This creates the new branch in Github and also publishes the changes to the branch . It might ask you to pick a branch if there is no root branch and you select "Origin".  You can also select the "..." button and select the "Push" menu to push the code to Github
![image](https://user-images.githubusercontent.com/29865785/55114893-89a56300-50b9-11e9-91f2-a087fb0d69fa.png)
1. Create a new pull request from Github repository.Choose two branches to see what’s changed or to start a new pull request.
![image](https://user-images.githubusercontent.com/29865785/55115276-8363b680-50ba-11e9-9607-1b334621e7dd.png)
1. Add screenshots/details on the changes to the new pull request and send it for approval

1. Once another developer approves the request, you can merge the pull request to Master so the changes will show up in Master
![image](https://user-images.githubusercontent.com/29865785/55115558-29172580-50bb-11e9-9145-8d6efaeef2a9.png)
![image](https://user-images.githubusercontent.com/29865785/55115634-5b288780-50bb-11e9-9df2-222deb199907.png)
1. Remember to delete the branch in Github once the changes are merged to Master (usually the approver/Ashwin takes care of this step)
1. Final step is make sure you go back to the Master branch  in the VS code project  and sync it so the changes show up in the "local Master"