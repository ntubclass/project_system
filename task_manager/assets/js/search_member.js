document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.querySelector('.search-input');
  const memberItems = document.querySelectorAll('.member-item');
  
  searchInput.addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase().trim();
    
    memberItems.forEach(item => {
      const memberName = item.querySelector('.member-name').textContent.toLowerCase();
      const memberEmail = item.querySelector('.member-email').textContent.toLowerCase();
      const memberRole = item.querySelector('.member-role').textContent.toLowerCase();
      
      if (memberName.includes(searchTerm) || 
          memberEmail.includes(searchTerm) || 
          memberRole.includes(searchTerm)) {
        item.style.display = 'flex';
      } else {
        item.style.display = 'none';
      }
    });
    
    const visibleMembers = Array.from(memberItems).filter(item => item.style.display !== 'none');
    const noResultsMsg = document.querySelector('.no-results-message');
    
    if (visibleMembers.length === 0 && searchTerm !== '') {
      if (!noResultsMsg) {
        const message = document.createElement('div');
        message.className = 'no-results-message';
        message.textContent = '找不到符合的成員';
        document.querySelector('.members-container').appendChild(message);
      }
    } else {
      if (noResultsMsg) {
        noResultsMsg.remove();
      }
    }
  });
});
