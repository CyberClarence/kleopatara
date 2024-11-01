# Use the official Bun image as a base
FROM oven/bun:latest

# Set up environment variables
ENV USER=dev
ENV HOME=/home/$USER

# Install necessary packages
RUN apt-get update && apt-get install -y \
    zsh \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# Create a non-root user
RUN useradd -m -s /bin/zsh $USER





# Set up Oh My Zsh
RUN sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"

# Install NVM
ENV NVM_DIR $HOME/.nvm
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash

# Add NVM to .zshrc and create alias
RUN echo 'export NVM_DIR="$HOME/.nvm"' >> $HOME/.zshrc && \
    echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"' >> $HOME/.zshrc && \
    echo '[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"' >> $HOME/.zshrc && \
    echo 'alias push="git add . && git commit -m \"Update\" && git push origin main"' >> $HOME/.zshrc


# Install Node.js LTS and npm
RUN . $NVM_DIR/nvm.sh && \
    nvm install --lts && \
    nvm use --lts && \
    npm install -g npm@latest

# Install Wrangler
RUN bun install -g wrangler

# Set working directory
WORKDIR $HOME/

# it's a dev container, so we don't need to install dependencies here
# COPY package.json bun.lockb* ./
# RUN bun install
# COPY . .

# Set up Zsh as the default shell
SHELL ["/bin/zsh", "-c"]
# Set the hostname
RUN echo "vm" > /etc/hostname

# Change ownership of the home directory to the non-root user
RUN chown -R $USER:$USER $HOME

# Switch to the non-root user
USER $USER

# Add NVM to PATH
ENV PATH $NVM_DIR/versions/node/$(nvm current)/bin:$PATH

# Expose the port your app runs on
EXPOSE 3000

# dont need cause we have a devcontainer.json
# CMD ["bun", "run", "dev"]
