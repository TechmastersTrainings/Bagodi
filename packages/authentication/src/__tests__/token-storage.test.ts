/**
 * Token Storage Strategy Unit Tests
 */

import { tokenStorage } from "../token-storage";

describe("Token Storage Strategy", () => {
  beforeEach(() => {
    tokenStorage.clearTokens();
  });

  it("should securely store and retrieve access token in memory", () => {
    tokenStorage.setAccessToken("test_access_token_jwt");
    expect(tokenStorage.getAccessToken()).toBe("test_access_token_jwt");
  });

  it("should clear both access and refresh tokens on logout", () => {
    tokenStorage.setAccessToken("test_access_token_jwt");
    tokenStorage.setRefreshToken("test_refresh_token_jwt");

    tokenStorage.clearTokens();

    expect(tokenStorage.getAccessToken()).toBeNull();
    expect(tokenStorage.getRefreshToken()).toBeNull();
  });
});

