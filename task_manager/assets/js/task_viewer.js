document.addEventListener('DOMContentLoaded', function () {
    const buttons = document.querySelectorAll('.status-switch .switch-option');
    const taskViewerContainer = document.getElementById('taskViewerContainer');

    const linkElement = document.createElement('link');
    linkElement.rel = 'stylesheet';
    linkElement.href = '/static/css/calendar_custom.css';
    document.head.appendChild(linkElement);

    buttons.forEach(button => {
        button.addEventListener('click', function () {
            // Remove 'active' class from all buttons
            buttons.forEach(btn => btn.classList.remove('active'));
            // Add 'active' class to the clicked button
            this.classList.add('active');

            // Get the view type from the data attribute
            const view = this.getAttribute('data-view');

            if (view == "calendar") {
                taskViewerContainer.innerHTML = '<div id="calendar"></div>';
                
                const calendarEl = document.getElementById('calendar');
                const calendar = new FullCalendar.Calendar(calendarEl, {
                    initialView: 'dayGridMonth',
                    headerToolbar: {
                        left: 'prev,next',
                        center: 'title',
                        right: 'today'
                    },
                    locale: 'zh-tw',
                    eventTimeFormat: { 
                        hour: '2-digit',
                        minute: '2-digit',
                        meridiem: false
                    },
                    events: function(fetchInfo, successCallback, failureCallback) {
                        const pathParts = window.location.pathname.split('/');
                        const projectId = pathParts[pathParts.length - 1];
                        
                        fetch(`/api/project/${projectId}/tasks/`)
                            .then(response => response.json())
                            .then(data => {
                                const events = data.map(task => ({
                                    id: task.id,
                                    title: task.name,
                                    start: task.start_date,
                                    end: task.end_date,
                                    color: task.progress >= 100 ? 'var(--dark-green)' : 'var(--dark-blue)',
                                    className: task.progress >= 100 ? 'task-completed' : 'task-in-progress',
                                    extendedProps: {
                                        progress: task.progress,
                                        description: task.description
                                    }
                                }));
                                successCallback(events);
                            })
                            .catch(error => {
                                console.error('獲取任務數據失敗:', error);
                                failureCallback(error);
                            });
                    },
                    eventClick: function(info) {
                        alert(`任務: ${info.event.title}\n進度: ${info.event.extendedProps.progress}%\n開始: ${info.event.start.toLocaleDateString()}\n結束: ${info.event.end ? info.event.end.toLocaleDateString() : '無結束日期'}`);
                    }
                });
                calendar.render();

                window.addEventListener('resize', function() {
                    calendar.updateSize();
                });
            } else if (view == "gantt") {
                taskViewerContainer.innerHTML = '<div id="gantt" class="gantt-target"></div>';
                const tasks = [];
                
                const gantt = new Gantt("#gantt", tasks, {
                    step: 24,
                    bar_height: 25,
                    container_height: 600,
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
            } else if (view == "list") {
                loadListView();
            }
        });
    });
});