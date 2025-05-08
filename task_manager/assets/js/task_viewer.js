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
            taskViewerContainer.innerHTML = '<div id="gantt" class="gantt-target"></div>';
            const tasks = [];
            
            const gantt = new Gantt("#gantt", tasks, {
            step: 24,
            bar_height: 25,
            container_height : 600,
            bar_corner_radius: 3,
            arrow_curve: 5,
            padding: 18,
            view_mode: 'Day',
            date_format: 'YYYY-MM-DD',
            custom_popup_html: function(task) {
                return `
                    <div class="details-container">
                        <h4>${task.name}</h4>
                        <p>開始: ${task.start}</p>
                        <p>結束: ${task.end}</p>
                        <p>進度: ${task.progress}%</p>
                    </div>
                `;
            }
            });
          }
        });
    });
});