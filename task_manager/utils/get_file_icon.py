def main(file_name):
    file_type_icons = {
        'pdf':    { 'icon': 'fa-file-pdf',       'bgClass': 'pdf-icon' },
        'doc':    { 'icon': 'fa-file-word',      'bgClass': 'word-icon' },
        'docx':   { 'icon': 'fa-file-word',      'bgClass': 'word-icon' },
        'xls':    { 'icon': 'fa-file-excel',     'bgClass': 'excel-icon' },
        'xlsx':   { 'icon': 'fa-file-excel',     'bgClass': 'excel-icon' },
        'ppt':    { 'icon': 'fa-file-powerpoint','bgClass': 'ppt-icon' },
        'pptx':   { 'icon': 'fa-file-powerpoint','bgClass': 'ppt-icon' },
        'jpg':    { 'icon': 'fa-file-image',     'bgClass': 'image-icon' },
        'jpeg':   { 'icon': 'fa-file-image',     'bgClass': 'image-icon' },
        'png':    { 'icon': 'fa-file-image',     'bgClass': 'image-icon' },
        'gif':    { 'icon': 'fa-file-image',     'bgClass': 'image-icon' },
        'txt':    { 'icon': 'fa-file-alt',       'bgClass': 'text-icon' },
        'zip':    { 'icon': 'fa-file-archive',   'bgClass': 'archive-icon' },
        'rar':    { 'icon': 'fa-file-archive',   'bgClass': 'archive-icon' },
        'mp3':    { 'icon': 'fa-file-audio',     'bgClass': 'audio-icon' },
        'mp4':    { 'icon': 'fa-file-video',     'bgClass': 'video-icon' },
        'default':{ 'icon': 'fa-file',           'bgClass': 'default-icon' }
    }
    ext = file_name.split('.')[-1].lower()
    return file_type_icons.get(ext, file_type_icons['default'])