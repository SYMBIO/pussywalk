//
//  Updater.swift
//  Pussywalk
//
//  Created by Páll Zoltán on 14/12/2017.
//  Copyright © 2017 Pussywalk. All rights reserved.
//

import Foundation
import Zip

class UpdaterRequestError: Error {
  let message: String

  init(message: String) {
    self.message = message
  }
}

class UpdaterRequest {

  enum UpdaterRequestBasePaths: String {
    case domain = "http://www.pussywalk.com"
    case subdomain = "http://presidentevil:dikyvole123@2.pussywalk.com"
  }

  let relativeURL: String
  var completionBlock: ((Data) -> Void)?

  init(relativeURL: String) {
    self.relativeURL = relativeURL
  }

  func load() {
    DispatchQueue.global(qos: .default).async {
      do {
        try self.load(urlString: UpdaterRequestBasePaths.domain.rawValue + self.relativeURL)
      } catch {
        do {
          print("Error thrown when loading \(UpdaterRequestBasePaths.domain.rawValue + self.relativeURL)")
          try self.load(urlString: UpdaterRequestBasePaths.subdomain.rawValue + self.relativeURL)
        } catch {
          print("Error thrown when loading \(UpdaterRequestBasePaths.subdomain.rawValue + self.relativeURL)")
        }
      }
    }
  }

  private func load(urlString: String) throws {
    guard let url = URL(string: urlString) else {
      throw UpdaterRequestError(message: "bad url")
    }
    let data = try Data(contentsOf: url)
    self.completionBlock?(data)
  }
}

class Updater {
  private var newUpdateHash: String?

  private let documentsURL: URL
  private let bundleURL: URL

  public var buildPath: String {
    return self.documentsURL.appendingPathComponent("build").path
  }

  init() {
    self.documentsURL = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
    self.bundleURL = Bundle.main.bundleURL
  }

  public func start() {

    let sourceURL: URL
    let destURL: URL
    let updateURL: URL

    destURL = self.documentsURL.appendingPathComponent("build")
    sourceURL = self.bundleURL.appendingPathComponent("build")
    updateURL = self.documentsURL.appendingPathComponent("update")

    print("\(destURL.path)")

    if !FileManager.default.fileExists(atPath: destURL.path) {
      // Copy from Bundle to Documents
      do {
        if FileManager.default.fileExists(atPath: destURL.path) {
          try FileManager.default.removeItem(at: destURL)
        }
        try FileManager.default.copyItem(at: sourceURL, to: destURL)
      } catch {
        print("Error copying from Bundle/build to Documents/build")
      }
    } else if FileManager.default.fileExists(atPath: updateURL.appendingPathComponent("build").path) {
      do {
        let hash = try String(contentsOf: updateURL.appendingPathComponent("update.hash"))
        try FileManager.default.removeItem(at: destURL)
        try FileManager.default.copyItem(at: updateURL.appendingPathComponent("build"), to: destURL)

        UserDefaults.standard.set(hash, forKey: "updateHash")

        try FileManager.default.removeItem(at: updateURL)
      } catch {
        print("Error copying from Documents/update to Documents/build")
      }
    }

    // Check for update

    let request = UpdaterRequest(relativeURL: "/app/update")
    request.completionBlock = { (data: Data) in
      let newHash = String(data: data, encoding: .utf8)
      let hash = UserDefaults.standard.string(forKey: "updateHash")
      if newHash != hash {
        self.newUpdateHash = newHash
        self.downloadData()
      }
    }
    
    request.load()
  }

  func downloadData() {
    let request = UpdaterRequest(relativeURL: "/app/build.zip")
    request.completionBlock = { (data: Data) in
      self.unpack(data)
    }

    request.load()
  }

  func unpack(_ data: Data) {
    do {
      var fileURL: URL
      let updateURL: URL

      fileURL = self.documentsURL.appendingPathComponent("update.zip")
      updateURL = self.documentsURL.appendingPathComponent("update")

      if FileManager.default.fileExists(atPath: updateURL.path) {
        try FileManager.default.removeItem(at: updateURL)
      }
      try FileManager.default.createDirectory(at: updateURL, withIntermediateDirectories: true, attributes: nil)

      try data.write(to: fileURL)
      try Zip.unzipFile(fileURL, destination: updateURL, overwrite: true, password: nil)
      try FileManager.default.removeItem(at: fileURL)

      fileURL = updateURL.appendingPathComponent("update.hash")

      try self.newUpdateHash?.write(to: fileURL, atomically: true, encoding: .utf8)
    } catch {
      print("Error unzipping. \(self.newUpdateHash ?? "" )")
    }
  }

}
