FROM pulumi/pulumi-nodejs:latest

#Create a new user and group named "pulumi"
RUN groupadd -r pulumi && useradd -r -g pulumi pulumi

#create home directory for pulumi user
RUN mkdir /home/pulumi
RUN mkdir /home/pulumi/.kube

#set the home directory to /home/pulumi
ENV HOME=/home/pulumi

#Set the working directory to /home/pulumi
WORKDIR /home/pulumi

COPY . /home/pulumi/src
RUN rm /home/pulumi/src/Pulumi.dev.yaml

#install dependencies
RUN apt-get update && apt-get install -y \
    unzip vim default-mysql-client iputils-ping\
    && rm -rf /var/lib/apt/lists/*


ADD https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip .
RUN unzip awscli-exe-linux-x86_64.zip
RUN ./aws/install

#install kubectl on linux
#1) download kubectl binary from https://kubernetes.io/docs/tasks/tools/install-kubectl/
ADD https://dl.k8s.io/release/v1.21.1/bin/linux/amd64/kubectl .
#2) copy kubectl binary to /usr/local/bin/kubectl
RUN install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
#3) verify kubectl is installed
RUN kubectl version --client
#4) install stern binary
ADD https://github.com/wercker/stern/releases/download/1.11.0/stern_linux_amd64 .
#5) copy stern binary to /usr/local/bin/stern
RUN install -o root -g root -m 0755 stern_linux_amd64 /usr/local/bin/stern
#6) verify stern is installed
RUN stern --version
RUN rm stern_linux_amd64
RUN rm kubectl
RUN rm -rf aws
RUN rm awscli-exe-linux-x86_64.zip


WORKDIR /home/pulumi/src
RUN npm install

RUN apt autoclean -y \
    && apt autoremove -y \
    && rm -rf /var/lib/apt/lists/

#set all permissions to pulumi user
RUN chown -R pulumi:pulumi /home/pulumi
RUN chmod +x /home/pulumi/src/start.sh


# set the user to pulumi
USER pulumi

ENTRYPOINT ["./start.sh"]
