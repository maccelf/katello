module Actions
  module Katello
    module ContentViewVersion
      class Import < Actions::EntryAction
        def plan(organization:, path:, metadata:)
          metadata_map = ::Katello::Pulp3::ContentViewVersion::MetadataMap.new(metadata: metadata)

          import = ::Katello::Pulp3::ContentViewVersion::Import.new(
            organization: organization,
            metadata_map: metadata_map,
            path: path,
            smart_proxy: SmartProxy.pulp_primary!
          )

          import.check!

          gpg_helper = ::Katello::Pulp3::ContentViewVersion::ImportGpgKeys.
                          new(organization: organization,
                              metadata_gpg_keys: metadata_map.gpg_keys)
          gpg_helper.import!

          sequence do
            plan_action(AutoCreateProducts, import: import)
            plan_action(AutoCreateRepositories, import: import, path: path)
            plan_action(AutoCreateRedhatRepositories, import: import, path: path)

            if metadata_map.syncable_format?
              plan_action(::Actions::BulkAction,
                    ::Actions::Katello::Repository::Sync,
                    import.intersecting_repos_library_and_metadata.exportable(format: metadata_map.format),
                    skip_candlepin_check: true
                    )
            end

            if import.content_view
              plan_action(ResetContentViewRepositoriesFromMetadata, import: import)
              plan_action(::Actions::Katello::ContentView::Publish, import.content_view, metadata_map.content_view_version.description,
                            path: path,
                            metadata: metadata,
                            importing: !metadata_map.syncable_format?,
                            syncable: metadata_map.syncable_format?,
                            major: metadata_map.content_view_version.major,
                            minor: metadata_map.content_view_version.minor)
              plan_self(content_view_id: import.content_view.id)
            end
          end
        end

        def finalize
          if task.execution_plan.run_steps.any? { |s| s.action_class == ::Actions::Pulp3::ContentViewVersion::CreateImport && s.state != :success }
            ::Katello::EventQueue.push_event(::Katello::Events::DeleteLatestContentViewVersion::EVENT_TYPE, input[:content_view_id])
          end
        end

        def humanized_name
          _("Import Content View Version")
        end
      end
    end
  end
end
