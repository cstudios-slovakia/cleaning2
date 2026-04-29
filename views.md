# views

##   

## layout
*   on desktop the menu should be on the left
*   on mobile use a bottom navigation to make the layout efficient
## dashboard
### for admins,owners
it shows a grid of color coded values where each collumn is a property and each row is s a room. if everything is OK, the square is grey, if the cleaning is due on the day the dash is open, use blue color, if the cleaning is overdue use orange. If the room needs immediate cleaning use red. When the cleaner has the room view open, add a slight purple to the tile indicating that it is being cleaned.
under the tab there should be a log selection for properties
### for managers
managers have a simmilar view as the admins and the owners, but only seeing collumns where they are assigned to. also they have clickable cards for each property with two options: view property (shows the property room list), manage property shows the property details
### for cleaners
they will have a grouped list of due and overdue cleaning assigments (color coded)
## properties
*   list of properties visible to all.
*   admins, owners can add a new property
## property detail
*   admins, owners and managers can set the default schedule cleaning time (if not set, the settings default would be used)
*   admins, owners, managers can add rooms, cleaners to the property
*   admins, owners can add managers to the property
*   admins and owners can add and change the name, logo, cover image and color theme of the property
## property room list
*   list of rooms in a property - everyone sees it
*   admin, owner, manager can add a new room
## room detail
*   everyone sees the room detail
*   next assigment is visible
*   cleaning log is visible
*   it has a button for express cleaning - which creates an assigment for cleaning for the current time so it becames immediately overdue
*   owner, admin and manager can see the task list (which instantiate the cleaning assigment), also the auto intervall and other settings

## assigment list
*   it is a list compiled of all the active assigments grouped by property and time of assigments
*   the times are the following from top to bottom:
    *   overdue
    *   today
    *   tomorrow - this list is not open by default, needs to be expanded
    *   future - this list is not open by default, needs to be expanded
## cleaning assigment detail
*   when clicking anywhere the assigment is shown it will open this view
*   it has the name of the property, room the cleaning assigment is assigned to
*   also the date and the time to make the assigment
*   the assigment has a task list, which can be checked by anyone
*   in the end of the list there is the finished button
*   when the finished button is clicked the cleaning assigment done by value is set for the current time and the logged in user is set as the one who cleaned it (done by)
*   if the done by value is set, only admins, owners and managers can edit the assigment

## login screen
*   using a tab system for managers and cleaners
*   where managers use password and email to log in
*   cleaners username and pin
## settings
the following can be set by the admin, owner:
\-scheduled cleaning time for the room - it is the time of the day when the room must be cleaned by default - not applicable for instant cleaning. So when the scheduled time is tuesday and the deadline set here is 13:00 so the cleaning deadline is tuesday 13:00
\-cleaners list - can create cleaners

admins, oners can:
\-create cleaners and managers

this can be set by the admin
\-system name - the name of the system shown everywhere
\-system default language and default theme (for login screens and property list views)
\-can create admins, owners, cleaners and managers