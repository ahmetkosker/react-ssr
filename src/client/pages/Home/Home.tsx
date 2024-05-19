import React, { useState } from "react";

const Home: React.FC = () => {
  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center">
      <div className="max-w-lg w-full p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-semibold mb-4">React SSR</h1>
        <p className="text-lg mb-6">
          This project provides a template for server-side rendering (SSR) with
          React.
        </p>
        <h2 className="text-xl font-semibold mb-2">Installation</h2>
        <p className="mb-4">
          To get started, clone this repository and navigate to its directory:
        </p>
        <pre className="bg-gray-200 p-4 mb-6">
          <code>
            git clone https://github.com/ahmetkosker/react-ssr.git
            <br />
            cd react-ssr
          </code>
        </pre>
        <p>Then, install the project dependencies using Yarn:</p>
        <pre className="bg-gray-200 p-4 mb-6">
          <code>yarn install</code>
        </pre>
        <h2 className="text-xl font-semibold mb-2">Usage</h2>
        <p>
          This project includes several commands to help you with development
          and production:
        </p>
        <ul className="list-disc pl-6 mb-6">
          <li className="mb-2">Start Development Environment:</li>
          <pre className="bg-gray-200 p-4 mb-4">
            <code>yarn start:dev</code>
          </pre>
          <li className="mb-2">Compile for Production:</li>
          <pre className="bg-gray-200 p-4 mb-4">
            <code>yarn build</code>
          </pre>
          <li className="mb-2">Start the Server:</li>
          <pre className="bg-gray-200 p-4 mb-6">
            <code>yarn start</code>
          </pre>
        </ul>
        <h2 className="text-xl font-semibold mb-2">Contributing</h2>
        <p className="mb-6">
          We welcome contributions! If you'd like to contribute to this project,
          please review our{" "}
          <a className="text-blue-500" href="CONTRIBUTING.md">
            contribution guidelines
          </a>{" "}
          before getting started.
        </p>
        <h2 className="text-xl font-semibold mb-2">License</h2>
        <p className="mb-6">
          This project is licensed under the terms of the{" "}
          <a className="text-blue-500" href="LICENSE">
            MIT License
          </a>
          .
        </p>
        <h2 className="text-xl font-semibold mb-2">Contact</h2>
        <p className="mb-6">
          For any questions or feedback regarding the project, please feel free
          to reach out to{" "}
          <a className="text-blue-500" href="https://github.com/ahmetkosker">
            Ahmet Köşker
          </a>{" "}
          via email at exarons@gmail.com.
        </p>
      </div>
    </div>
  );
};

export default Home;
