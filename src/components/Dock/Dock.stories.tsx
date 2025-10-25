import type { Meta, StoryObj } from "@storybook/react";
import { Dock } from "./Dock";

const meta = {
  title: "Components/Dock",
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// Icon Components
const HomeIcon = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const FolderIcon = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

const DocumentIcon = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const SettingsIcon = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const SearchIcon = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const StarIcon = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const HeartIcon = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const PlusIcon = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const MailIcon = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const CalendarIcon = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const ImageIcon = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const MusicIcon = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
);

export const Default: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "200px",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        borderRadius: "12px",
      }}
    >
      <Dock.Root>
        <Dock.Item label="Home" onClick={() => alert("Home clicked")}>
          <HomeIcon />
        </Dock.Item>
        <Dock.Item label="Folder" onClick={() => alert("Folder clicked")}>
          <FolderIcon />
        </Dock.Item>
        <Dock.Item label="Documents" onClick={() => alert("Documents clicked")}>
          <DocumentIcon />
        </Dock.Item>
        <Dock.Item label="Search" onClick={() => alert("Search clicked")}>
          <SearchIcon />
        </Dock.Item>
        <Dock.Item label="Settings" onClick={() => alert("Settings clicked")}>
          <SettingsIcon />
        </Dock.Item>
      </Dock.Root>
    </div>
  ),
};

export const WithManyItems: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "200px",
        background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
        borderRadius: "12px",
      }}
    >
      <Dock.Root>
        <Dock.Item label="Home">
          <HomeIcon />
        </Dock.Item>
        <Dock.Item label="Folder">
          <FolderIcon />
        </Dock.Item>
        <Dock.Item label="Documents">
          <DocumentIcon />
        </Dock.Item>
        <Dock.Item label="Mail">
          <MailIcon />
        </Dock.Item>
        <Dock.Item label="Calendar">
          <CalendarIcon />
        </Dock.Item>
        <Dock.Item label="Images">
          <ImageIcon />
        </Dock.Item>
        <Dock.Item label="Music">
          <MusicIcon />
        </Dock.Item>
        <Dock.Item label="Search">
          <SearchIcon />
        </Dock.Item>
        <Dock.Item label="Favorites">
          <StarIcon />
        </Dock.Item>
        <Dock.Item label="Settings">
          <SettingsIcon />
        </Dock.Item>
      </Dock.Root>
    </div>
  ),
};

export const AllPositions: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "32px",
        minHeight: "600px",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        borderRadius: "12px",
        padding: "32px",
      }}
    >
      {/* Top Dock */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Dock.Root position="top">
          <Dock.Item label="Home">
            <HomeIcon />
          </Dock.Item>
          <Dock.Item label="Folder">
            <FolderIcon />
          </Dock.Item>
          <Dock.Item label="Documents">
            <DocumentIcon />
          </Dock.Item>
          <Dock.Item label="Search">
            <SearchIcon />
          </Dock.Item>
          <Dock.Item label="Settings">
            <SettingsIcon />
          </Dock.Item>
        </Dock.Root>
      </div>

      {/* Middle Row with Left, Center, Right */}
      <div style={{ display: "flex", gap: "32px", flex: 1 }}>
        {/* Left Dock */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <Dock.Root position="left">
            <Dock.Item label="Home">
              <HomeIcon />
            </Dock.Item>
            <Dock.Item label="Folder">
              <FolderIcon />
            </Dock.Item>
            <Dock.Item label="Documents">
              <DocumentIcon />
            </Dock.Item>
            <Dock.Item label="Search">
              <SearchIcon />
            </Dock.Item>
            <Dock.Item label="Settings">
              <SettingsIcon />
            </Dock.Item>
          </Dock.Root>
        </div>

        {/* Center Content */}
        <div style={{ flex: 1 }} />

        {/* Right Dock */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <Dock.Root position="right">
            <Dock.Item label="Home">
              <HomeIcon />
            </Dock.Item>
            <Dock.Item label="Folder">
              <FolderIcon />
            </Dock.Item>
            <Dock.Item label="Documents">
              <DocumentIcon />
            </Dock.Item>
            <Dock.Item label="Search">
              <SearchIcon />
            </Dock.Item>
            <Dock.Item label="Settings">
              <SettingsIcon />
            </Dock.Item>
          </Dock.Root>
        </div>
      </div>

      {/* Bottom Dock */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Dock.Root position="bottom">
          <Dock.Item label="Home">
            <HomeIcon />
          </Dock.Item>
          <Dock.Item label="Folder">
            <FolderIcon />
          </Dock.Item>
          <Dock.Item label="Documents">
            <DocumentIcon />
          </Dock.Item>
          <Dock.Item label="Mail">
            <MailIcon />
          </Dock.Item>
          <Dock.Item label="Calendar">
            <CalendarIcon />
          </Dock.Item>
          <Dock.Item label="Search">
            <SearchIcon />
          </Dock.Item>
          <Dock.Item label="Favorites">
            <StarIcon />
          </Dock.Item>
          <Dock.Item label="Settings">
            <SettingsIcon />
          </Dock.Item>
        </Dock.Root>
      </div>
    </div>
  ),
};
