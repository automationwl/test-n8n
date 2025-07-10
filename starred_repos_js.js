/**
 * Fetch and display GitHub starred repositories
 */

class GitHubStarredRepos {
    constructor(username) {
        this.username = username;
        this.apiUrl = `https://api.github.com/users/${username}/starred`;
    }

    async fetchStarredRepos() {
        try {
            const response = await fetch(this.apiUrl);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const repos = await response.json();
            return repos;
        } catch (error) {
            console.error('Error fetching starred repositories:', error);
            return null;
        }
    }

    formatRepoData(repos) {
        return repos.map(repo => ({
            name: repo.name,
            full_name: repo.full_name,
            description: repo.description,
            html_url: repo.html_url,
            stargazers_count: repo.stargazers_count,
            forks_count: repo.forks_count,
            language: repo.language,
            created_at: repo.created_at,
            updated_at: repo.updated_at,
            owner: {
                login: repo.owner.login,
                html_url: repo.owner.html_url
            }
        }));
    }

    generateMarkdown(repos) {
        const formattedRepos = this.formatRepoData(repos);
        
        let markdown = `# 🌟 Starred Repositories by ${this.username}\n\n`;
        markdown += `> Total repositories: ${repos.length}\n\n`;
        
        // Top 10 by stars
        const topRepos = formattedRepos
            .sort((a, b) => b.stargazers_count - a.stargazers_count)
            .slice(0, 10);
        
        markdown += `## 🔥 Top 10 Most Starred\n\n`;
        
        topRepos.forEach((repo, index) => {
            markdown += `### ${index + 1}. [${repo.name}](${repo.html_url})\n`;
            markdown += `**Owner**: [${repo.owner.login}](${repo.owner.html_url})\n`;
            markdown += `**Description**: ${repo.description || 'No description'}\n`;
            markdown += `**Language**: ${repo.language || 'N/A'} | `;
            markdown += `**Stars**: ⭐ ${repo.stargazers_count.toLocaleString()} | `;
            markdown += `**Forks**: 🍴 ${repo.forks_count.toLocaleString()}\n\n`;
        });
        
        // All repositories table
        markdown += `## 📊 All Repositories\n\n`;
        markdown += `| Repository | Description | Language | Stars | Forks |\n`;
        markdown += `|------------|-------------|----------|-------|-------|\n`;
        
        formattedRepos.forEach(repo => {
            const name = `[${repo.name}](${repo.html_url})`;
            const description = repo.description ? 
                (repo.description.length > 80 ? 
                    repo.description.substring(0, 80) + '...' : 
                    repo.description) : 
                'No description';
            const language = repo.language || 'N/A';
            const stars = `⭐ ${repo.stargazers_count.toLocaleString()}`;
            const forks = `🍴 ${repo.forks_count.toLocaleString()}`;
            
            markdown += `| ${name} | ${description} | ${language} | ${stars} | ${forks} |\n`;
        });
        
        return markdown;
    }

    async generateReport() {
        console.log(`Fetching starred repositories for ${this.username}...`);
        
        const repos = await this.fetchStarredRepos();
        
        if (!repos) {
            console.error('Failed to fetch repositories');
            return null;
        }
        
        console.log(`Found ${repos.length} starred repositories`);
        
        const markdown = this.generateMarkdown(repos);
        const jsonData = JSON.stringify(this.formatRepoData(repos), null, 2);
        
        return {
            markdown,
            json: jsonData,
            count: repos.length
        };
    }
}

// Usage example
async function main() {
    const username = 'that-one-tom'; // Change this to any GitHub username
    const starredRepos = new GitHubStarredRepos(username);
    
    const report = await starredRepos.generateReport();
    
    if (report) {
        console.log('Markdown Report:');
        console.log(report.markdown);
        
        // If running in Node.js, you can save to files
        if (typeof require !== 'undefined') {
            const fs = require('fs');
            fs.writeFileSync('README.md', report.markdown);
            fs.writeFileSync('starred-repos.json', report.json);
            console.log('Files saved: README.md and starred-repos.json');
        }
    }
}

// Run if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
    main();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GitHubStarredRepos;
}
