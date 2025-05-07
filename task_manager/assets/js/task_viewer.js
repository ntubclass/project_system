document.addEventListener('DOMContentLoaded', function () {
    const buttons = document.querySelectorAll('.status-switch .switch-option');
    const taskViewerContainer = document.getElementById('taskViewerContainer');

    buttons.forEach(button => {
        button.addEventListener('click', function () {
            // Remove 'active' class from all buttons
            buttons.forEach(btn => btn.classList.remove('active'));
            // Add 'active' class to the clicked button
            this.classList.add('active');

            // Get the view type from the data attribute
            const view = this.getAttribute('data-view');

          if(view =="gantt") {
            taskViewerContainer.innerHTML = '<div id="gantt"></div>';
            const gantt = new Gantt("#gantt", [], {
                view_mode: "Day",
            });
          }
        });
    });
});